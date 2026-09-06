# MediKiosk Backend Tests

This directory contains automated tests for the MediKiosk backend.

## Manual Real E2E ABDM Test

There is a specialized test that executes the real, end-to-end ABDM Sandbox OTP enrollment flow. This test hits the actual ABDM sandbox APIs and requires real user interaction.

### Prerequisites

1.  A valid Sandbox Aadhaar Number (provided by the ABDM Sandbox portal, do NOT use a real citizen's Aadhaar).
2.  Set `TEST_AADHAAR_NUMBER` in your `.env` file.
    ```env
    TEST_AADHAAR_NUMBER=999988887777
    ```
    *Note: The number must belong to a consenting team member acting as the test subject.*

### Running the Test

Run the test using pytest with the `manual` marker, and the `-s` flag to allow interactive prompts for the OTP:

```bash
pytest tests/test_abdm_real_e2e.py -m manual -s
```

During execution, the test will pause and ask you to enter the OTP received on the mobile number linked to the test Aadhaar.
