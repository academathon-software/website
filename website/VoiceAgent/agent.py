"""Ace — Academathon voice agent worker.

Run:
    python agent.py dev          # local dev (auto-reload)
    python agent.py start        # production
"""

from __future__ import annotations

import logging
import os
import random

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    RoomInputOptions,
    WorkerOptions,
    cli,
)
from livekit.plugins import openai, silero

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

    turn_detection = None
    try:
        from livekit.plugins.turn_detector.multilingual import MultilingualModel
        turn_detection = MultilingualModel()
    except Exception:
        try:
            from livekit.plugins.turn_detector.english import EnglishModel
            turn_detection = EnglishModel()
        except Exception:
            log.info("turn_detector not available; using VAD-only endpointing.")

    session = AgentSession(
        stt=openai.STT(model="whisper-1", language="en"),
        llm=openai.LLM(model="gpt-4o", temperature=0.7),
        tts=openai.TTS(model="tts-1", voice="nova"),
        vad=silero.VAD.load(),
        turn_detection=turn_detection,
        aec_warmup_duration=0,
    )

    await session.start(
        agent=AceAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(),
    )

    ACE_GREETINGS = [
        "Hi! I'm Ace, your Academathon assistant. How can I help you today?",
        "Hey there! I'm Ace from Academathon. Are you looking for a tutor, or do you have questions about our services?",
        "Hello! I'm Ace — here to help you find the right tutor. What can I do for you?",
        "Hi, I'm Ace! Whether it's booking a session or learning about pricing, I've got you. What's on your mind?",
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
