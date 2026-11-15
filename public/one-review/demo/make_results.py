#!/usr/bin/env python3
"""Build RESULTS.md from the run records and the two pre-registered keys. Rerun: python3 make_results.py"""
import json,re,glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def fl(s,which):
    ms=re.findall(r'FLAGGED\s*:\s*([0-9,\s]*)',s or '')
    ms=[m for m in ms if re.search(r'\d',m)]
    if not ms: return None
    return set(int(x) for x in re.findall(r'\d+',ms[0 if which=='first' else -1]))
out=['# Demo results (built by make_results.py from the run records; do not edit by hand)','']
tot=0
for name,keyf,runs in [('Demo 1: lockout procedure, 10 planted defects in 22 steps','ANSWER_KEY_demo1.json','runs'),('Demo 2: reliability summary, 7 planted errors in 18 statements','ANSWER_KEY_demo2.json','runs2')]:
    key=json.load(open(keyf)); D=set(int(k) for k in key['planted_defects']); n=len(D)
    out+=['## '+name,'','Score = planted errors found, by the pre-registered rule (the first FLAGGED line). "Extras" = flagged items that are not in the key. "Last line" = post-hoc score using the last FLAGGED line instead, shown only where it differs.','']
    for f in sorted(glob.glob(runs+'/*.json')):
        d=json.load(open(f)); tot+=d['spent_usd']
        secs=''
        try:
            from datetime import datetime as T
            secs=', %d seconds'%((T.fromisoformat(d['finished'][:-1])-T.fromisoformat(d['started'][:-1])).total_seconds())
        except Exception: pass
        out+=['### Run %s (%s mode, state %s, $%.4f%s)'%(d['task_id'],d.get('mode'),d['state'],d['spent_usd'],secs),'','| Step | Model | Phase | Score | Missed | Extras | Last line | Cost |','|---|---|---|---|---|---|---|---|']
        for i,st in enumerate(d['steps'],1):
            ph={'view':'alone (baseline)','reply':'after reading the others','summary':'panel summary (final)',None:'chain step'}[st.get('phase')]
            if 'error' in st: out.append('| %d | %s | %s | EMPTY REPLY | | | | $%.4f |'%(i,st['role'],ph,st['cost_usd'])); continue
            s=st['envelope']['summary']; a=fl(s,'first'); b=fl(s,'last')
            if a is None: out.append('| %d | %s | %s | NO FLAGGED LINE | | | | $%.4f |'%(i,st['role'],ph,st['cost_usd'])); continue
            j=lambda x:', '.join(map(str,sorted(x))) or 'none'
            out.append('| %d | %s | %s | %d of %d | %s | %s | %s | $%.4f |'%(i,st['role'],ph,len(a&D),n,j(D-a),j(a-D),('%d of %d'%(len(b&D),n) if b!=a else ''),st['cost_usd']))
        out.append('')
out+=['Total spent on these runs: $%.4f.'%tot,'']
open('RESULTS.md','w').write('\n'.join(out)); print('\n'.join(out))
