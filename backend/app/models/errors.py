from typing import Literal

ErrorCode = Literal["not_found", "invalid_request", "upstream_failed", "timeout"]


class ApiError(Exception):
    STATUS = {"invalid_request": 400, "not_found": 404, "upstream_failed": 502, "timeout": 504}

    def __init__(self, code: ErrorCode, message: str):
        self.code = code
        self.message = message
        self.status = self.STATUS[code]
        super().__init__(message)
