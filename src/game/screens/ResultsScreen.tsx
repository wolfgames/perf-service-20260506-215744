import { useScreen } from '~/core/systems/screens';
import { Button } from '~/core/ui/Button';
import { gameState } from '~/game/state';

export function ResultsScreen() {
  const { goto } = useScreen();

  const handlePlayAgain = () => {
    gameState.reset();
    goto('game');
  };

  const handleMainMenu = () => {
    goto('start');
  };

  return (
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black px-6">
      <h1 class="text-3xl font-bold text-white mb-2">
        Game Over
      </h1>

      <div class="text-center mb-8">
        <p class="text-white/60 text-sm mb-1">Score</p>
        <p class="text-5xl font-bold text-white">
          {gameState.score()}
        </p>
      </div>

      <div class="flex gap-4">
        <Button onClick={handlePlayAgain}>
          Play Again
        </Button>
        <Button variant="secondary" onClick={handleMainMenu}>
          Main Menu
        </Button>
      </div>
    </div>
  );
}
