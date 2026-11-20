import hashlib


def calculate_file_hash(file):
    """
    Calculate SHA256 hash of an uploaded file.
    """

    sha256 = hashlib.sha256()

    # Start reading from beginning
    file.file.seek(0)

    while True:
        chunk = file.file.read(4096)

        if not chunk:
            break

        sha256.update(chunk)

    # Reset pointer so FastAPI can read the file again
    file.file.seek(0)

    return sha256.hexdigest()


class HashUtils:

    @staticmethod
    def sha256(file_path):

        sha = hashlib.sha256()

        with open(file_path, "rb") as file:

            while True:

                chunk = file.read(4096)

                if not chunk:
                    break

                sha.update(chunk)

        return sha.hexdigest()

