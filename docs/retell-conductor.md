Here's my review of the Dental Clinic agent (single-prompt, voice, multilingual EN/HU/DE). The prompt is genuinely well-built — strong language handling, anti-hallucination rules for doctor names, a search-loop cap, and deliberate phone-number capture. The issues below are worth addressing, roughly in priority order.

Issues that affect callers
1. The agent promises a human transfer it can't perform. The "Request to Speak to a Human" rule tells the agent to say "Let me transfer you to our office staff. Please hold for a moment," then end the call. There is no transfer_call tool configured, so the caller is told they're being transferred and instead gets hung up on — a bad experience and a trust problem. Two ways to fix:

Add a real transfer — configure a transfer_call tool with the office number and actually route them, or
Be honest — change the script to offer a callback instead (e.g. "Our office staff aren't available on this line, but I can have someone call you back") and log it via capture_patient_info with callback_requested=true.
I'd recommend deciding which one you want; I can implement either.

2. Rescheduling cancels the old appointment before securing the new one. The reschedule flow calls cancel_appointment first (step 3), then runs the full scheduling flow. If no suitable new slot is found, or book_appointment fails, the caller walks away with no appointment at all and may not realize it. Safer ordering: confirm availability for the new time first, then cancel the old one only once the new booking succeeds. At minimum, the prompt should handle the "cancelled but couldn't rebook" case explicitly.

Settings worth a look
3. interruption_sensitivity is 0.9 (quite high). Higher means the agent stops talking more readily when it hears speech or background noise. This agent reads back long phone numbers and appointment slots — exactly the moments you don't want it cut off by clinic background noise or a caller's "mm-hm." Consider lowering it for more resilient readbacks.

4. end_call_after_silence_ms is 62 seconds. That's a long dead-air window before hangup. Not wrong, but 30–40s is usually plenty and avoids leaving an abandoned caller on the line for a full minute.

5. Voice vs. multilingual scope. The voice is openai-Chloe, but the agent fully serves Hungarian and German callers. Worth confirming Chloe sounds natural in Hungarian specifically — if native-sounding HU/DE matters, a different voice may serve better. Minor, but easy to overlook.

Minor / polish
English & German phone formats are unfinished. The Phone Number Capture section fully specifies the Hungarian format but explicitly defers EN/DE ("will be defined later"). Since the agent serves all three languages today, it's worth filling these in so non-Hungarian numbers get the same grouped capture-and-readback discipline.
get_faq_answer vs. knowledge base. The agent has a KB config (top_k: 3) but routes all FAQs through the get_faq_answer webhook. If there's no knowledge base actually attached, that config is inert — fine, just confirming the FAQ design is intentional.
None of these are emergencies, but #1 (fake transfer) and #2 (reschedule ordering) are real correctness/trust issues I'd fix first.

Want me to draft the changes? Tell me your call on the transfer question (real transfer vs. honest callback) and I'll put together proposals for that plus #2, and whichever settings tweaks you want

### fixing

All three changes are proposed and ready for your review:

Honest callback instead of fake transfer — the "Request to Speak to a Human" rule now explicitly tells the agent not to promise or attempt a transfer, and instead to offer a callback and log it via capture_patient_info (callback_requested=true). No more telling callers they're being transferred right before hanging up.

Reschedule books before it cancels — the reschedule flow now secures and books the new appointment first, then cancels the old one only after the new booking succeeds. It also handles both failure cases (couldn't rebook → leave the old appointment untouched; cancel fails after rebooking → confirm new, log a callback to remove the old). The combined recap was reordered to match.

EN/DE phone formats filled in — German callers get a +49 model with the same grouped read-back-and-confirm discipline as Hungarian; English-speaking callers get country-code-aware grouping (UK and US/Canada examples). The "defined later" placeholder is gone.

I left the tuning/quality items alone since they aren't consistency fixes: interruption_sensitivity 0.9 (agent gets cut off easily during long readbacks), end_call_after_silence_ms 62s, and the openai-Chloe voice for Hungarian/German. Say the word if you'd like me to address any of those.

Once you've reviewed and accepted these, I'd suggest running a few simulation tests (e.g. a reschedule where no new slot is available, a German caller giving a phone number, a human-transfer request) to confirm the new behavior holds. That's a billed run, so just let me know if you want me to set it up.



Review changes
Submitted
GLOBAL (1)
General Prompt
1 change
Accepted
All three prompt changes are now applied. Want me to set up those simulation tests to verify the new behavior, or is there anything else you'd like to adjust?

### settings

1. set interruption_sensitivity to 0.5
2. set end_call_after_silence_ms to 30 sec
3. suggest a new voice/voices because a native-sounding HU/DE matters

Done on the first two — both are proposed:

interruption_sensitivity → 0.5 (the agent will be noticeably more resilient to background speech/noise during long phone-number and slot readbacks).
end_call_after_silence_ms → 30000 (30s).
On the voice
The agent is currently on openai-Chloe. OpenAI voices are usable multilingually but tend to carry an English accent into Hungarian and German — which is exactly what you're trying to avoid. The biggest lever for native-sounding HU/DE isn't the individual voice so much as the TTS provider + model, so I'd steer toward one of these:

ElevenLabs with a multilingual model (eleven_multilingual_v2, or eleven_v3 / eleven_turbo_v2_5). This is the strongest option for natural Hungarian and German pronunciation and prosody.
Cartesia (sonic) multilingual voices — also good for DE; HU coverage is weaker, so audition it.
One caveat on tradeoffs: a single voice has to sound good in all three languages, since the agent switches mid-call. So pick one voice and preview it speaking EN, HU, and DE rather than optimizing for one language.

I can't audition voices or pull the live catalog from here, and the docs don't rank voices per language — so the reliable path is to preview candidates in the dashboard voice selector (you can hear each one before selecting). Shortlist a couple of ElevenLabs multilingual voices, test them on a Hungarian and a German sentence, and pick the best.

Two things to know when you switch:

If you move off a platform voice to a custom ElevenLabs/Cartesia voice, you'll want to set fallback_voice_ids (voices from a different provider) so there's TTS coverage during a provider outage — platform voices handle this automatically, non-platform ones don't.
I'd also set the matching voice_model (e.g. eleven_multilingual_v2) so the multilingual model is actually used.
Tell me which voice ID you land on from the dashboard, and I'll propose the voice_id (plus voice_model and fallback_voice_ids) update for you.







