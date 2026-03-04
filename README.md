# Guess the Picture - 2 Player Game

A real-time multiplayer web game where two players try to guess each other's secret picture by asking yes/no questions.

## Game Rules

1. **Join a Room**: Players can create or join a game room using a 6-character room code
2. **Get Your Secret Picture**: Each player is randomly assigned a secret picture that they cannot see
3. **Take Turns**: Players alternate asking yes/no questions about their opponent's picture
4. **Answer Questions**: The opponent must answer only "Yes" or "No" to questions
5. **Make a Guess**: At any time during your turn, you can guess which picture your opponent has
6. **Win or Lose**:
   - Correct guess = You win!
   - Wrong guess = You lose your turn

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime (WebSockets)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Features

- Real-time multiplayer gameplay
- Private game rooms with shareable codes
- Turn-based question and answer system
- Visual image grid with 12 different pictures
- Live chat interface
- Instant win/lose detection
- Play again functionality
- Responsive design (mobile and desktop)
- Automatic player disconnection handling
- Modern, beautiful UI with smooth animations

## Project Structure

```
src/
├── components/
│   ├── Home.tsx           # Landing page for creating/joining rooms
│   ├── WaitingRoom.tsx    # Lobby screen waiting for 2nd player
│   ├── GameScreen.tsx     # Main gameplay screen
│   ├── ChatPanel.tsx      # Question/answer chat interface
│   └── ImageGrid.tsx      # Grid of pictures for guessing
├── hooks/
│   └── useGameState.ts    # Game state management and real-time updates
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── types/
│   └── game.ts            # TypeScript type definitions
├── App.tsx                # Main app with routing logic
├── main.tsx               # App entry point
└── index.css              # Global styles
```

## Database Schema

### Tables

1. **pictures** - Stores available pictures for the game
   - 12 pre-populated images from various categories (animals, vehicles, nature, food, landmarks, sports)

2. **rooms** - Game room information
   - Unique room codes
   - Room status (waiting, playing, finished)
   - Winner tracking

3. **players** - Player information
   - Player names and numbers (1 or 2)
   - Assigned secret pictures
   - Turn tracking
   - Connection status

4. **messages** - Chat history
   - Questions, answers, and system messages
   - Real-time message delivery

## How to Play

### Starting a Game

1. **Player 1**: Click "Create New Room" and share the room code
2. **Player 2**: Enter the room code and click "Join Room"
3. Wait in the lobby until both players are connected
4. Game automatically starts when 2 players join

### During the Game

1. **Your Turn**:
   - Ask a yes/no question about your opponent's picture
   - Wait for their answer
   - Click on any picture to make a guess (optional)

2. **Opponent's Turn**:
   - Wait for their question
   - Answer with "Yes" or "No" buttons
   - Browse the picture grid to narrow down possibilities

3. **Making a Guess**:
   - Click any picture in the grid
   - Confirm your selection
   - If correct: You win!
   - If wrong: You lose your turn

### Winning

- First player to correctly guess their opponent's picture wins
- Winner is announced with the revealed picture
- Both players can choose to play again or leave

## Game Tips

- Ask strategic questions that eliminate multiple pictures
- Use categories (animals, vehicles, food, etc.) to narrow down options
- Pay attention to previous questions and answers
- Don't guess too early unless you're certain!

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (database is already configured)

### Environment Variables

The following environment variables are already configured in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
```

### Run Development Server

The development server starts automatically. Your app will be available at the URL shown in the terminal.

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

## Deployment

This app is ready to deploy on any modern hosting platform that supports:
- Static site hosting (frontend)
- PostgreSQL database (Supabase handles this)

Recommended platforms:
- **Vercel** - Automatic deployments from Git
- **Netlify** - Simple drag-and-drop deployment
- **Render** - Full-stack hosting

### Deployment Steps

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Ensure environment variables are set on the hosting platform
4. Database is already configured in Supabase (no additional setup needed)

## Security Features

- Row Level Security (RLS) enabled on all database tables
- Public read access for pictures only
- Room-based access control for players and messages
- No authentication required (anonymous access)
- Secure real-time subscriptions

## Image Credits

All images are sourced from Pexels.com and are free to use under the Pexels License.

## License

MIT License - feel free to use this project for learning or personal use.

## Future Enhancements

Possible features to add:
- Player avatars
- Sound effects
- Turn timer
- Score history
- Private/public room modes
- Custom picture sets
- In-game hints system
- Mobile app version
- Spectator mode
- Tournament brackets

---

Enjoy playing Guess the Picture!
