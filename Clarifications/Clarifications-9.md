Got it — scratched party mode. So Professor Oak's three jobs are:                                      
  1. View users — see player profiles + their progress                                                   
  2. Set questions and tiers for Pokemon — curate which questions each Pokemon asks and at what  difficulty                                                                                             
  3. Upload a question set ad-hoc — import a JSON file of questions to overlay onto the bank                  
  Still 3 design decisions I need before I write the spec:

  Q1 — How does Oak log in?                             
                             
  - (a) Separate URL /admin with username + password (Recommended) — invisible to the kid, can't accidentally land on it, works as a "secret" entry. Ok                                             
  - (b) Same login screen as kids — username oak + stronger password unlocks admin role
  - (c) Master password modal accessible from a hidden tap (e.g. tap the Pokedex logo 5 times)           
  Q2 — Where do Oak's edits persist?                                                                     

  This is the most important decision. Without a backend, admin changes can only go to localStorage (device-local) OR be exported as files for you to commit to the repo.                                  
  - (a) localStorage only — quick, works in the browser, but changes you make on your laptop don't reach  the kid's iPad until the backend exists. Good for "iterate on content for myself today" but useless
  across devices.                                                                                        
  - (b) localStorage + Export-to-JSON button (Recommended) — edits live in localStorage immediately. Whenyou're happy, click "Export" to download a JSON file that you commit to the repo. Next time the kidpulls the latest build, the edits go live everywhere.                                               
  - (c) Pure file-import only — no live editing. You author JSON externally, drag-drop into Oak to test, drag back out to commit.                                                                               

  I recommend (b) because it gives you the live-editing experience while preserving the "commit it   forever" path. After Drop 4 (backend), we'd add a "Save to cloud" button that pushes edits server-side instead of exporting. ok

  Q3 — What kind of edits should Oak support? (Pick all that apply)
  - (a) Per-Pokemon tier override — "make Pikachu tier 1 instead of tier 2 because my kid is younger"
  - (b) Per-Pokemon subject override — "make Pikachu use Chinese questions even though it's in the math range"                                      
  - (c) Bank-level question CRUD — add/edit/delete individual questions in the math/english/chinese tier banks via a form UI                                   
  - (d) Bulk import — drag a JSON file into Oak, it merges into the bank (or replaces it)                
  - (e) View user stats — for each profile, see most-missed questions, accuracy per skill, longest streak
  - (f) Reset a user — wipe a player's progress (in case the kid wants a fresh start)  

I want to be able to:
1. Since now topic is by range. I want to easily set range to topics. eg.g (I can set 1-151 = English and it would mean all current pokemon is english. Or i can say 1-71 = chinese, 72 to 151 = math. )
2. Since core of the game is easier levels are lower tier. As you grow level or evolve, it becomes higher tier, i want to be able to control difficulty by having a global setting. If i set age 7. The tiers 1-4 should be within a 7 year old's ability. If i set 12 year old, then tier 1-4 should be a different question bank. Please structure my database appropriately
3. There should be a UI that i can set ad-hoc questions as well. This will be fed into the folder "ad-hoc". And there will be tier 1-4 as well.