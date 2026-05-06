import { useScreen } from '~/core/systems/screens';
import { Button } from '~/core/ui/Button';
import { getResultsScreenData } from '~/game/runbench/screens/ResultsScreenData';
import { fpsTier } from '~/game/runbench/systems/PerfTracker';

export function ResultsScreen() {
  const { goto } = useScreen();

  // Read persisted run data from localStorage at mount (DOM lifecycle per GDD)
  const data = getResultsScreenData();

  const handleRetry = () => {
    goto('game');
  };

  const handleHome = () => {
    goto('start');
  };

  return (
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black px-6">
      <h1 class="text-3xl font-bold text-white mb-6">
        Run Complete
      </h1>

      <div class="text-center mb-4">
        <p class="text-white/60 text-sm mb-1">Distance</p>
        <p class="text-5xl font-bold text-white">
          {data.lastDistance}m
        </p>
      </div>

      <div class="text-center mb-4">
        <p class="text-white/60 text-sm mb-1">Best Distance</p>
        <p class="text-2xl font-semibold text-white">
          {data.bestDistance}m
        </p>
      </div>

      <div class="text-center mb-4">
        <p class="text-white/60 text-sm mb-1">FPS Average</p>
        <p class="text-2xl font-semibold text-white">
          {data.lastFpsAvg} fps
        </p>
        <p class="text-white/50 text-sm">
          {fpsTier(data.lastFpsAvg)}
        </p>
      </div>

      <div class="text-center mb-8">
        <p class="text-white/40 text-xs">
          Run #{data.runCount}
        </p>
      </div>

      {/* Buttons: both >=44px tap targets, >=8px spacing */}
      <div class="flex gap-3">
        <Button
          size="lg"
          onClick={handleRetry}
          class="min-h-[44px] min-w-[44px]"
        >
          RETRY
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={handleHome}
          class="min-h-[44px] min-w-[44px]"
        >
          HOME
        </Button>
      </div>
    </div>
  );
}
