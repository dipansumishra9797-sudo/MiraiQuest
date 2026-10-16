# MiraiQuest 🎮

**A gamified learning platform for Mirai School of Technology (MSOT).**
MiraiQuest turns everyday learning into a game. Students earn verified XP from attendance, classwork, quizzes, tests and coding practice, and stay motivated with streaks, quests, leagues and team battles.

## ✨ Features

### For Students
- **XP and levels** with a full XP history ledger showing how every point was earned
- **Daily quiz** on topics taught that week (3 to 5 questions, one XP-earning attempt per day)
- **Streaks with freezes** so one missed day doesn't wipe progress
- **Badges and quests**, including improvement badges so everyone can earn rewards
- **Weekly leagues** with promotion and relegation, plus batch and campus leaderboards
- **Team battles** with a live scoreboard
- **Peer help board** to earn XP for helping classmates
- **Privacy controls**: anonymous mode and leaderboard opt-out

### For Teachers
- Class engagement dashboard and struggling-topic insights
- "Gone quiet" student list with supportive nudges
- Question bank with AI-generated questions and an approval queue
- XP audit with the ability to void suspicious XP (with a logged reason)

### For Admins
- Editable XP rules engine (no code changes needed)
- Anti-gaming checks and XP spike audit
- League, battle and rewards management

### General
- Phone-number login: the backend decides whether the user is a student or teacher and shows a separate app for each
- Light and dark mode for every role

## 🧠 Design Principles
1. **Learning first**: every XP point maps to a real learning action.
2. **Fair and inclusive**: students who are behind can still win through personal bests and improvement badges.
3. **Separate from grades**: game points never change official marks.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express (TypeScript)
- **AI:** Google Gemini API


## 📁 Project Structure

```
MiraiQuest/
├── src/            # Frontend source code
├── server.ts       # Backend server
├── index.html
├── .env.example    # Environment variable template
└── package.json
```
