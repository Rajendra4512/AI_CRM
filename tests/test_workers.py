from workers.ingestion import process_document, run_ml_scoring, send_notification

def test_process_document_task():
    result = process_document("doc-test-123")
    assert result["status"] == "processed"
    assert result["document_id"] == "doc-test-123"

def test_run_ml_scoring_task():
    result = run_ml_scoring("tenant-test-456")
    assert result["status"] == "completed"
    assert result["tenant_id"] == "tenant-test-456"

def test_send_notification_task():
    result = send_notification("user-789", "Deal Won!")
    assert result["status"] == "sent"
    assert result["user_id"] == "user-789"

