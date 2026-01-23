from contextlib import contextmanager
from typing import Generator
import psycopg2
from psycopg2.extras import execute_values
from prefect.blocks.system import Secret


@contextmanager
def get_cursor(secret_name: str = "neon-connection-string") -> Generator[psycopg2.extensions.cursor, None, None]:
    conn_string = Secret.load(secret_name).get()
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    try:
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def upsert_many(
    cur: psycopg2.extensions.cursor,
    table: str,
    columns: list[str],
    rows: list[tuple],
    conflict_column: str,
    update_columns: list[str],
) -> int:
    cols = ", ".join(columns)
    updates = ", ".join([f"{col} = EXCLUDED.{col}" for col in update_columns])
    query = f"""
        INSERT INTO {table} ({cols}) VALUES %s
        ON CONFLICT ({conflict_column}) DO UPDATE SET {updates}
    """
    execute_values(cur, query, rows)
    return cur.rowcount
