import logging
from django.db import transaction
from django.db.models import F
from .models import Submission, TestCase, UserStats

logger = logging.getLogger(__name__)

def run_code_with_piston(code: str, input_data: str) -> str:
    """
    Executes code using the Piston API.
    Placeholder/stub function for the actual integration.
    """
    # Default placeholder, assuming actual integration is handled elsewhere or later.
    return ""

def evaluate_submission(submission_id: int):
    """
    Fetches a submission, executes its code against all testcases for the problem
    using run_code_with_piston, and updates the submission status.
    """
    try:
        # Fetch submission and related TestCases
        # Use select_related in submission queries to avoid N+1 issues
        submission = Submission.objects.select_related('user', 'problem').get(id=submission_id)
    except Submission.DoesNotExist:
        logger.error(f"Submission {submission_id} does not exist.")
        return

    # Fetch test cases for the problem
    testcases = list(TestCase.objects.filter(problem=submission.problem))
    total_testcases = len(testcases)
    passed_testcases = 0

    # Ensure code is available, default to empty string if not explicitly defined yet
    code = getattr(submission, 'code', '')

    # Check for existing ACCEPTED submission to prevent integrity errors and stat duplicate additions
    already_accepted = Submission.objects.filter(
        user=submission.user, 
        problem=submission.problem, 
        status='ACCEPTED'
    ).exists()

    # DO NOT wrap external HTTP calls inside atomic block
    # Execute code for each testcase
    for testcase in testcases:
        try:
            # Execute code
            output = run_code_with_piston(code, testcase.input_data)
        except Exception as e:
            logger.error(f"Error executing code for submission {submission_id}: {e}")
            output = ""

        if output is None:
            output = ""

        # Normalize output (strip trailing spaces per line, handle \r\n properly, remove trailing empty lines)
        normalized_output = '\n'.join([line.rstrip() for line in output.replace('\r\n', '\n').split('\n')]).rstrip()
        normalized_expected = '\n'.join([line.rstrip() for line in testcase.expected_output.replace('\r\n', '\n').split('\n')]).rstrip()
        
        if normalized_output == normalized_expected:
            passed_testcases += 1

    # Determine status
    if total_testcases > 0 and passed_testcases == total_testcases:
        # If already accepted previously, we can skip setting ACCEPTED again if it violates unique constraint,
        # but the constraint is on (user, problem) WHERE status='ACCEPTED'.
        # To avoid IntegrityError, if already_accepted is True, we can't save another 'ACCEPTED'.
        # We can set it back to PENDING or just return, but we want to note they passed it.
        # However, the user said "We can set the new submission status back to PENDING or just log and delete it, or better yet, since the requirement is "guard before setting status='ACCEPTED' to check if already accepted", we might not update status to ACCEPTED if it's already there."
        # Actually, let's set it to 'ACCEPTED' only if not already_accepted. If already_accepted, we can set it to some other valid status like 'FAILED' or leave it to avoid IntegrityError, wait, in models STATUS_CHOICES are PENDING, ACCEPTED, FAILED. It's safer to leave as PENDING or set to FAILED, or better, to just delete the new submission or keep it PENDING. But user might be confused. If we leave it PENDING it's weird. Wait, let's just use FAILED, or better, wait, let's check what user said: "Prevent IntegrityError if a user tries to submit ACCEPTED for the same problem twice. Add application-level guard before setting status='ACCEPTED' to check if already accepted."
        if already_accepted:
             # Already accepted, maybe just keep the status as is (PENDING) or FAILED. 
             # Or we can just log it and leave it PENDING. Let's keep it PENDING or make it, wait, we can't make it ACCEPTED.
             # Actually, they might be running the code again for fun. Let's set it to something safe.
             # The constraint says only one ACCEPTED. So we can't save it as ACCEPTED.
             # Let's just leave it as PENDING and log, or maybe set to FAILED if not allowed.
             status = 'PENDING' # Fallback
             logger.info(f"User {submission.user.id} already has ACCEPTED for problem {submission.problem.id}. Setting current to PENDING to avoid IntegrityError.")
        else:
             status = 'ACCEPTED'
    else:
        status = 'FAILED'

    # Wrap database updates in transaction.atomic()
    # Keep transactions short for MySQL compatibility
    with transaction.atomic():
        # Update submission fields
        submission.status = status
        submission.passed_testcases = passed_testcases
        submission.total_testcases = total_testcases
        submission.save()

        # If all testcases pass and it's newly ACCEPTED
        if status == 'ACCEPTED':
            # Ensure UserStats exists for user avoiding IntegrityError or DoesNotExist
            UserStats.objects.get_or_create(user=submission.user)
            
            # Use F() expression to safely increment UserStats
            UserStats.objects.filter(user=submission.user).update(
                score=F('score') + 10, # Assuming +10 score per accepted solution
                problems_solved=F('problems_solved') + 1
            )
