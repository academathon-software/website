"""Ace — Academathon voice agent worker.

Run:
    python agent.py dev          # local dev (auto-reload)
    python agent.py start        # production
"""

from __future__ import annotations

import logging
import random
import re
from typing import AsyncIterable

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    tts as agents_tts,
)
from livekit.plugins import deepgram, openai, silero

from prompts import ACE_SYSTEM_PROMPT

# Intercept any variation of the name before it hits TTS and replace with
# a phonetic respelling that OpenAI TTS reliably pronounces correctly.
_NAME_RE = re.compile(r'\bAcademathon\b', re.IGNORECASE)
_PHONETIC = "Ah-cad-emathon"


def _fix_pronunciation(text: str) -> str:
    return _NAME_RE.sub(_PHONETIC, text)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("ace.agent")


class AceAgent(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=ACE_SYSTEM_PROMPT)

    async def tts_node(
        self,
        text: AsyncIterable[str],
        model_settings: agents_tts.TTSCapabilities | None = None,
    ) -> AsyncIterable[agents_tts.SynthesizedAudio]:
        async def _fixed():
            async for chunk in text:
                yield _fix_pronunciation(chunk)

        async for audio in super().tts_node(_fixed(), model_settings):
            yield audio


async def entrypoint(ctx: JobContext) -> None:
    log.info("Connecting to room %s", ctx.room.name)
    await ctx.connect()

    vad = silero.VAD.load(
        min_silence_duration=0.2,
        min_speech_duration=0.05,
        activation_threshold=0.55,
    )

    turn_detection = None
    try:
        from livekit.plugins.turn_detector.multilingual import MultilingualModel
        turn_detection = MultilingualModel()
        log.info("turn_detector loaded")
    except Exception:
        log.info("turn_detector not found — run: python3 -m livekit.agents download-files")

    session = AgentSession(
        stt=deepgram.STT(
            model="nova-2",
            language="en-US",
            interim_results=True,
            smart_format=True,
            punctuate=True,
        ),
        llm=openai.LLM(model="gpt-4o-mini", temperature=0.6),
        tts=openai.TTS(model="tts-1", voice="nova"),
        vad=vad,
        turn_detection=turn_detection,
        min_endpointing_delay=0.2,
        max_endpointing_delay=0.8,
        aec_warmup_duration=0,
    )

    await session.start(
        agent=AceAgent(),
        room=ctx.room,
    )

    ACE_GREETINGS = [
        "Hi! I'm Ace, your Academathon assistant. Are you a student looking for tutoring, or interested in becoming a tutor?",
        "Hey! I'm Ace from Academathon. Are you here to find a tutor, or are you looking to join our team as a tutor?",
        "Hi there! I'm Ace. Welcome to Academathon! Are you a student or a tutor today?",
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
