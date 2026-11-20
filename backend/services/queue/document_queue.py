from queue import Queue


class DocumentQueue:

    def __init__(self):

        self.queue = Queue()

    def add(self, pdf_path):

        self.queue.put(pdf_path)

    def get(self):

        if self.queue.empty():
            return None

        return self.queue.get()

    def empty(self):

        return self.queue.empty()

    def size(self):

        return self.queue.qsize()
