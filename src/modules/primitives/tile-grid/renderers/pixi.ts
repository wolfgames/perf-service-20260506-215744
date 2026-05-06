import { Graphics, Text } from 'pixi.js';
import { PixiRenderable } from '../../_base';
import { TILE_GRID_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a TileGrid
 */
export interface TileGridConfig {
  /** Number of columns */
  cols: number;
  /** Number of rows */
  rows: number;
  /** Cell size in pixels */
  cellSize?: number;
  /** Gap between cells */
  cellGap?: number;
  /** Cell corner radius */
  cellRadius?: number;
  /** Default cell color */
  defaultColor?: number;
  /** Show background behind grid */
  showBackground?: boolean;
  /** Make cells interactive */
  interactive?: boolean;
  /** Callback when a cell is tapped */
  onCellTap?: (col: number, row: number) => void;
}

interface CellRef {
  graphic: Graphics;
  label: Text | null;
  col: number;
  row: number;
  color: number;
}

/**
 * TileGrid — 2D grid of colored cells with optional labels.
 *
 * Used for match-3 boards, puzzle grids, color grids, tile-based games.
 * Cells are Graphics rectangles managed in a flat array. Update colors
 * and labels by (col, row) coordinates.
 */
export class TileGrid extends PixiRenderable {
  readonly cols: number;
  readonly rows: number;

  private cells: CellRef[][] = [];
  private background: Graphics | null = null;
  private cellSize: number;
  private cellGap: number;
  private cellRadius: number;
  private defaultColor: number;
  private onCellTap?: (col: number, row: number) => void;

  constructor(config: TileGridConfig) {
    super('tile-grid');

    const d = TILE_GRID_DEFAULTS;
    this.cols = config.cols;
    this.rows = config.rows;
    this.cellSize = config.cellSize ?? d.cellSize;
    this.cellGap = config.cellGap ?? d.cellGap;
    this.cellRadius = config.cellRadius ?? d.cellRadius;
    this.defaultColor = config.defaultColor ?? d.defaultColor;
    this.onCellTap = config.onCellTap;

    // Background
    if (config.showBackground !== false) {
      this.background = new Graphics();
      this.drawBackground();
      this.addChild(this.background);
    }

    // Build cell grid
    for (let row = 0; row < this.rows; row++) {
      const rowCells: CellRef[] = [];
      for (let col = 0; col < this.cols; col++) {
        const g = new Graphics();
        const x = d.backgroundPadding + col * (this.cellSize + this.cellGap);
        const y = d.backgroundPadding + row * (this.cellSize + this.cellGap);

        g.roundRect(x, y, this.cellSize, this.cellSize, this.cellRadius);
        g.fill({ color: this.defaultColor });

        if (config.interactive) {
          g.eventMode = 'static';
          g.cursor = 'pointer';
          g.on('pointertap', () => this.onCellTap?.(col, row));
        }

        this.addChild(g);
        rowCells.push({ graphic: g, label: null, col, row, color: this.defaultColor });
      }
      this.cells.push(rowCells);
    }
  }

  /** Set a cell's color */
  setCellColor(col: number, row: number, color: number): void {
    const cell = this.getCell(col, row);
    if (!cell) return;

    cell.color = color;
    this.redrawCell(cell);
  }

  /** Set a cell's text label */
  setCellLabel(col: number, row: number, text: string, color?: string): void {
    const cell = this.getCell(col, row);
    if (!cell) return;

    const d = TILE_GRID_DEFAULTS;
    const x = d.backgroundPadding + col * (this.cellSize + this.cellGap);
    const y = d.backgroundPadding + row * (this.cellSize + this.cellGap);

    if (!cell.label) {
      cell.label = new Text({
        text,
        style: { fontSize: this.cellSize * 0.5, fill: color ?? '#ffffff', align: 'center' },
      });
      cell.label.anchor.set(0.5);
      cell.label.x = x + this.cellSize / 2;
      cell.label.y = y + this.cellSize / 2;
      this.addChild(cell.label);
    } else {
      cell.label.text = text;
      if (color) cell.label.style.fill = color;
    }
  }

  /** Clear a cell back to default */
  clearCell(col: number, row: number): void {
    const cell = this.getCell(col, row);
    if (!cell) return;

    cell.color = this.defaultColor;
    this.redrawCell(cell);

    if (cell.label) {
      this.removeChild(cell.label);
      cell.label.destroy();
      cell.label = null;
    }
  }

  /** Get the pixel position of a cell's center */
  getCellCenter(col: number, row: number): { x: number; y: number } {
    const d = TILE_GRID_DEFAULTS;
    return {
      x: this.x + d.backgroundPadding + col * (this.cellSize + this.cellGap) + this.cellSize / 2,
      y: this.y + d.backgroundPadding + row * (this.cellSize + this.cellGap) + this.cellSize / 2,
    };
  }

  /** Total pixel width of the grid (including background padding) */
  get gridWidth(): number {
    const d = TILE_GRID_DEFAULTS;
    return d.backgroundPadding * 2 + this.cols * this.cellSize + (this.cols - 1) * this.cellGap;
  }

  /** Total pixel height of the grid (including background padding) */
  get gridHeight(): number {
    const d = TILE_GRID_DEFAULTS;
    return d.backgroundPadding * 2 + this.rows * this.cellSize + (this.rows - 1) * this.cellGap;
  }

  private getCell(col: number, row: number): CellRef | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return this.cells[row][col];
  }

  private redrawCell(cell: CellRef): void {
    const d = TILE_GRID_DEFAULTS;
    const x = d.backgroundPadding + cell.col * (this.cellSize + this.cellGap);
    const y = d.backgroundPadding + cell.row * (this.cellSize + this.cellGap);

    cell.graphic.clear();
    cell.graphic.roundRect(x, y, this.cellSize, this.cellSize, this.cellRadius);
    cell.graphic.fill({ color: cell.color });

    if (d.borderWidth > 0) {
      cell.graphic.stroke({ width: d.borderWidth, color: d.borderColor });
    }
  }

  private drawBackground(): void {
    if (!this.background) return;
    const d = TILE_GRID_DEFAULTS;
    this.background.clear();
    this.background.roundRect(0, 0, this.gridWidth, this.gridHeight, d.backgroundRadius);
    this.background.fill({ color: d.backgroundColor });
  }
}
