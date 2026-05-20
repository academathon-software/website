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

    # Tight VAD: only 250ms of silence needed to end a turn (default is ~800ms)
    vad = silero.VAD.load(
        min_silence_duration=0.25,
        min_speech_duration=0.05,
        activation_threshold=0.55,
    )

    session = AgentSession(
        stt=openai.STT(model="gpt-4o-mini-transcribe", language="en"),
        llm=openai.LLM(model="gpt-4o-mini", temperature=0.6),
        tts=openai.TTS(model="tts-1", voice="nova"),
        vad=vad,
        min_endpointing_delay=0.3,
        max_endpointing_delay=1.5,
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
