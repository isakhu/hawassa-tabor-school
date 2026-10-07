import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os

url = "postgresql+asyncpg://neondb_owner:npg_G8hTon6vNgtc@ep-wandering-shape-b4bsp8fz-pooler.c-6.us-east-2.aws.neon.tech/neondb?ssl=require"

async def test():
    try:
        engine = create_async_engine(url, echo=True)
        async with engine.connect() as conn:
            print("SUCCESSFULLY CONNECTED!")
    except Exception as e:
        print(f"FAILED TO CONNECT: {type(e).__name__} - {e}")

if __name__ == "__main__":
    asyncio.run(test())
