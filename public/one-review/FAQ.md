# Frequently asked questions

Each answer is checked against the capability matrix. Where the honest answer is "I don't know", it says so.

## What it is

**1. What exactly have you built?**
Two things. An approval gate: AI assistants from several companies can read one status page and file requests, and a request counts only when I approve that exact request with a passkey. And a script that puts one task to six AI models, records every answer and handoff, and stops for a human. Around those are a STOP button and a record that is chained so edits show.

**2. What is it for?**
Keeping every decision that matters with me while I use several AI tools. That's the whole idea.

**3. Is it a product?**
No. It's one person's project. Nothing is for sale and there's nothing to install.

**4. What's UNBOUNDED WHAT, then?**
The name of the wider project and the account I post from. UNBOUNDED ONE is the system.

**5. Who built it?**
I did, with heavy help from AI coding assistants. I'm a maintenance tradesman, not a software engineer. The assistants wrote most of the code. I made the decisions and pressed the buttons.

**6. How long did it take?**
About a month of evenings and weekends, starting in October 2026.

**7. What did it cost?**
Hosting is on a free or near-free tier. The multi-model script has cost under three dollars in model calls in total. The AI assistant subscriptions are the real cost.

**8. Last week you posted about a home assistant that can never act. Is this the same thing?**
Same system. That post was about the approval gate alone. This is the gate plus what sits around it, including the multi-model script and the parts that don't work.

## Are the AIs connected?

**9. Are the AIs actually connected to each other?**
No. Each is connected to the gate only. By design five of the eight keys can only read a status line and the rule text; three older keys can also file a request into my queue. Filing a request is a write: it takes my attention, and it is the main thing an attacker would aim at. None of them can approve anything. They are not connected to each other.

**10. Do they talk to each other?**
Only inside one script run, where the script passes one model's answer to the next. Nothing starts that by itself. Outside the script, I copy and paste between apps.

**11. Which AI systems are involved?**
Eight assistant apps hold a link to the gate. The script calls six models from five companies: Google, Anthropic, xAI, Mistral, Perplexity and OpenAI. Exact model names are in every run record.

**12. Are those the same AIs as in your phone apps?**
No. The script uses the paid developer versions through a broker. They know nothing about my chats in the apps.

**13. What is "the Coordinator"?**
A session of one vendor's assistant that organizes the work into threads. It can start more sessions of the same assistant and run the script. It cannot message any other AI. Calling it a coordinator of multiple AIs would overstate it.

**14. What happens without your intervention?**
Timers send alerts and copy the record. That's all. No AI starts work, and no request takes effect.

**15. So what part is automatic and what part is you?**
Automatic: the handoffs inside one script run, the record, the refusal of anything unapproved. Me: starting every task, carrying text between apps, every approval, every deployment.

**16. Can an AI approve its own request, or another AI's?**
No. Approval needs my passkey, on my device. In offline tests every attempt without it was refused.

**17. What can an AI actually do through the gate?**
Read whether STOP is on and how many items wait for me, read the rule text, and for some keys, file a request that waits. Nothing else.

**18. What happens when you approve a request?**
A line is added to a list and a row to the record. Nothing carries it out. There is no executor. That's the biggest missing piece.

**19. How many requests have you approved?**
Three, all on one evening, 14 November 2026. Before that the Approve button didn't work in any version and I didn't know.

## Does it work?

**20. What works?**
The gate refuses what it should, in offline tests. STOP holds in offline tests. The record chain recomputes. The script reaches six models and records everything. Three live approvals went through.

**21. What doesn't work?**
Nothing executes an approved request. The gate's own phone alerts fail. Monitoring can't see the AI link go down. The outside witness for the record was never connected. Deployments go around the gate. One exposed key (a status-only one: it reads status and the rule text, cannot file or approve) hasn't been replaced yet.

**22. Does using six models beat using one?**
Not on my tests, and my tests are small. On four panel runs over two made-up documents with planted errors, with answer keys written by one of the tested models, the six-model panel never beat the best single model, and it cost at least twenty times more than the cheapest correct single answer. What it did do: on the arithmetic task, two models that were wrong alone were right after reading the others. So it can pull a weak answer up. It didn't lift the best one. This doesn't show that multi-model review fails in general; it would take a larger test with independently written keys to say that.

**23. Then why use several models at all?**
On that evidence, mostly you shouldn't, if you know which model is best for the job. Where it helped was catching a weaker model's mistakes when I didn't know in advance which model would be weak. That is a much smaller claim than "more AIs are better".

**24. How do you reconcile it when the models disagree?**
The script doesn't reconcile. It records each position, each reply, and a summary that is told not to smooth over disagreement. A human decides. In one test a model changed its answer on a disputed item after reading the others, and the record shows exactly where and why.

**25. How are errors detected?**
For the gate: scripted tests, including tests of the tests (planted defects). For the script: an empty reply stops or skips the run and is recorded; every handoff is hashed. For answers: only a scored key or a human. The models don't reliably catch each other.

**26. How reliable is it?**
One model returned an empty reply in six of its eight calls, and both chain-mode runs stopped early because of it. Across repeated runs of the same task, most models gave the same answer and one or two changed. The numbers are in the run records; it's a small sample.

**27. How fast and how expensive is a run?**
A six-model panel takes two to three minutes and costs 12 to 13 cents. A single model's answer to the same task cost between a seventh of a cent and two cents.

**28. Has it ever failed in real use?**
Yes. An eight-minute outage of the AI link when a setting was saved with a hidden character in front of it. It was rolled back. Nothing told me; a session noticed while working.

## Verification

**29. What has been independently verified?**
Nothing. Every test was run by the AI assistants that helped build it, on my account.

**30. You mention a verifier. Isn't that independent?**
No. It's a separate session of the same assistant with a reviewer's instructions. A second look, not a second party.

**31. Other AIs reviewed it. Doesn't that count?**
It's feedback. Three AI apps read a briefing and found no break; five models critiqued a summary. None of them tested anything.

**32. Has any human outside looked?**
One person on Mastodon asked a sharp question that exposed a real limit: an approval is tied to the request but not to the state of the data it acts on. It's logged and not fixed. That's the only outside input so far.

**33. Can someone else reproduce it?**
The scored demo, yes, in principle: tasks, keys, run records, the scoring script and the script itself are in the package, and it runs in a mock mode without any key. Nobody outside has tried. The gate's source isn't released yet; its behaviour can be tested in a browser demo.

**34. How do I know the run records are real and not written by hand?**
Each step carries the model name, token counts and the broker's reported cost, and each handoff carries a hash of the one before. The stronger check is to rerun the same task file with your own key and compare.

**35. How do I know the answer keys weren't written after the results?**
Their hashes and a time stamp were recorded before the first run and are in the package. That's weaker than a third party holding the hash, and I say so. Better: you write the next key.

**36. Who wrote the scored tasks?**
An AI assistant from one of the six vendors, which is a bias. The second task was added after the first turned out too easy; that's disclosed in its key file.

**37. What would disprove your claims?**
Any one of: an unapproved, replayed or mismatched approval accepted by the gate; a request text that makes something act; a record entry changed without the chain breaking; a run record that doesn't match a rerun; a planted "error" in my keys that isn't an error. Any of those and I'll post the correction.

**38. What would change your own mind about its value?**
A qualified person saying "this is a standard pattern, here's the better version" would settle the novelty question. A reviewer failing to reproduce the demo would settle the reproducibility one.

## Safety and security

**39. Is it safe?**
The gate held in offline tests, with seven written limits. I would not call the whole setup safe. The way I deploy changes is the weak point.

**40. What's the worst security problem you know of?**
Changes are deployed by a signed-in tool on my home computer, driven by an AI session after I say yes in chat. That path goes around the gate. Whoever controls that tool could change who the approver is.

**41. Can I attack the live system?**
No. Please test only what's in the package: the demo page, the script, the records. The live system, its hosting, and any account, device or person are out of bounds.

**42. What about prompt injection?**
Inside the gate, request text is stored and shown as data, and the AIs have no tools there, so there's nothing for injected text to trigger. That held in offline tests. I can't speak for the vendors' apps on the other end.

**43. Does STOP really stop everything?**
In offline tests, every new request is refused while STOP is on, and only a passkey approval lifts it. I've used it for real many times. I have not yet drilled it against all eight AI links at once.

**44. What does "fails closed" mean here?**
When something breaks, it refuses, not allows. During the outage the AI link refused everyone. The gap is that nothing reported it.

**45. Is my data or anyone's data involved?**
The package contains no personal data. The scored tasks are made up. The live system holds my own household's information and none of that is shared, shown or testable.

**46. What stops an AI assistant from just doing things outside your gate?**
Nothing in my system. The gate controls what goes through the gate. An assistant with its own tools is governed by its vendor's permission prompts and by what I allow it. I don't claim otherwise.

**47. Are there secrets in what you published?**
No keys, addresses or account names. Every public file was scanned, and I'd want to know if anything slipped through.

## Why it matters, or doesn't

**48. What makes this different?**
Nothing in the architecture. In plain words this is an unaudited human-approval gate demo with no executor yet, plus a small multi-model test harness. Approval gates for AI agents exist as products and open-source projects, some with passkeys. Multi-model panels exist and have been studied. What may be mine is small: one gate shared by assistants from several vendors, run by one non-programmer, with the failures published. A combination of my own is not a new capability.

**49. Doesn't this already exist?**
Yes. The closest existing things I've been pointed to, and have not compared in detail: for the gate, human-in-the-loop approval for AI agents, such as LangGraph's interrupt-and-approve pattern, AutoGen's human approval, OpenAI's "require approval" setting for tools, HumanLayer, AgentAuth, and the approval steps in n8n and Zapier. For the test script, LLM-as-judge panels, ensembles, model debate and "Mixture of Agents". Those names came from AI assistants I asked to criticise this page, so check them yourself. If you know a closer one, please name it and I'll link it.

**50. Why should anyone care?**
Maybe they shouldn't. If there's a reason, it's one of these: the honest test result about multi-model panels, the list of what broke when one person ran this for a month, or the idea of trade-specific scored tasks for checking AI tools.

**51. Why didn't the six-model panel do better?**
I don't know for certain. On easy items every strong model is already right, so there's nothing to add, and discussion gives a wrong argument a chance to persuade. People who study this have reported similar results.

**52. What's the most useful thing here for someone else?**
My guess: the scored planted-error tasks. They're a cheap way for a tradesperson to check whether an AI tool knows their job. That's a guess, not a finding.

**53. Why do this as a tradesman and not leave it to engineers?**
Because I use these tools and wanted to know what I could trust. In my work, nobody signs off their own job. I wanted the same rule for AI.

**54. Did the AI assistants exaggerate what you had?**
At times, yes. Earlier write-ups in the project said more than the evidence supported, and I've had them correct it more than once. One public page was corrected the day after it went up. That's part of why I want outside eyes.

## Practical

**55. Can I see the source code?**
The multi-model script, its tests, the tasks and the records: yes, in the package. The gate's source: I'm deciding how to release it, since the live system runs the same code. The browser demo runs that code with made-up data.

**56. Can I get access to the live system?**
No.

**57. Are you looking for investment or a job?**
No. I'm looking for a technical opinion.

**58. Will you open-source it?**
The script and the test tasks, likely yes. The gate, once someone qualified tells me it's worth it and the release is safe.

**59. How do I send you a review?**
Reply in public where you saw this, or message me there. Five lines is enough: what you tested, what you expected, what happened, how to repeat it, your verdict. For a security problem, message me privately first.

**60. What happens to my review?**
It's published as you wrote it, with your name or handle if you want. If you show something is wrong, I post the correction the same day and credit you.
