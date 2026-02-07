import re

DEFAULT_CHUNK_SIZE = 256
DEFAULT_CHUNK_OVERLAP = 2


def split_sentences(text: str) -> list[str]:
    """LLM Generated function for splitting sentences."""
    pattern = r'(?<=[.!?])\s+'
    sentences = re.split(pattern, text)
    return [s.strip() for s in sentences if s.strip()]


def chunk_text(text: str, chunk_size: int = DEFAULT_CHUNK_SIZE, overlap: int = DEFAULT_CHUNK_OVERLAP) -> list[str]:
    if len(text) <= chunk_size:
        return [text]

    sentences = split_sentences(text)

    chunks = []
    cur_chunk = []
    cur_word_count = 0
    for s in sentences:
        words = s.split()
        if cur_word_count + len(words) > chunk_size and cur_chunk:
            chunks.append(" ".join(cur_chunk))
            cur_chunk = cur_chunk[-overlap:]
            cur_word_count = sum(len(sent.split()) for sent in cur_chunk)
        cur_chunk.append(s)
        cur_word_count += len(words)

    if cur_chunk:
        chunks.append(" ".join(cur_chunk))
    return chunks
