"""Ace — Academathon voice agent worker.

Run:
    python agent.py dev          # local dev (auto-reload)
    python agent.py start        # production
"""

from __future__ import annotations

import logging
import random

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.plugins.openai import realtime

from prompts import ACE_SYSTEM_PROMPT

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("ace.agent")


class AceAgent(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=ACE_SYSTEM_PROMPT)


async def entrypoint(ctx: JobContext) -> None:
    log.info("Connecting to room %s", ctx.room.name)
    await ctx.connect()

    session = AgentSession(
        llm=realtime.RealtimeModel(
            model="gpt-4o-realtime-preview",
            voice="shimmer",
            temperature=0.6,
        )
    )

    await session.start(
        agent=AceAgent(),
        room=ctx.room,
    )

    ACE_GREETINGS = [
        "Hi! I'm Ace, your ah-KAD-em-ah-thon assistant. Are you a student looking for tutoring, or interested in becoming a tutor?",
        "Hey! I'm Ace from ah-KAD-em-ah-thon. Are you here to find a tutor, or are you looking to join our team as a tutor?",
        "Hi there! I'm Ace. Welcome to ah-KAD-em-ah-thon! Are you a student or a tutor today?",
    ]
    await session.say(random.choice(ACE_GREETINGS), allow_interruptions=True)


def prewarm(proc) -> None:
    log.info("prewarm: ready")


def main() -> None:
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            initialize_process_timeout=60,
            num_idle_processes=1,
        )
    )


if __name__ == "__main__":
    main()
