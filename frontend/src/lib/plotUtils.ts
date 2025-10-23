/**
 * Utility functions for scientific plotting matching diversity.py conventions
 */

/**
 * Transpose a 2D matrix (equivalent to .T in Python/NumPy)
 */
export const transpose = (matrix: number[][]): number[][] => {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
    return matrix;
  }
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
};

/**
 * Apply FFT-shift and transpose for image display
 * Matches diversity.py xsoft() function (line 1303)
 *
 * @param image - 2D image array
 * @param alpha - Contrast enhancement exponent (default 1.0)
 * @returns Shifted and transposed image ready for Plotly
 */
export const applyFFTShift = (image: number[][], alpha: number = 1.0): number[][] => {
  const N = image.length;
  const M = image[0].length;
  const shifted: number[][] = Array(M)
    .fill(0)
    .map(() => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      // FFT shift + transpose (.T in Python)
      const shiftI = (i + Math.floor(N / 2)) % N;
      const shiftJ = (j + Math.floor(M / 2)) % M;
      const val = image[shiftI][shiftJ];
      // Apply alpha (contrast enhancement)
      shifted[j][i] = Math.sign(val) * Math.pow(Math.abs(val), alpha);
    }
  }
  return shifted;
};

/**
 * Calculate zoom bounds for pupil display
 * Matches diversity.py zone calculation (line 1209)
 */
export const getPupilZoomBounds = (N: number, pdiam: number): [number, number] => {
  const zoomMin = (N - pdiam * 1.1) / 2;
  const zoomMax = (N + pdiam * 1.1) / 2;
  return [zoomMin, zoomMax];
};

/**
 * Create pupil circle shape for Plotly overlay
 * Matches pupilArtist from diversity.py
 */
export const createPupilCircleShape = (N: number, pdiam: number) => ({
  type: "circle" as const,
  xref: "x" as const,
  yref: "y" as const,
  x0: N / 2 - pdiam / 2,
  y0: N / 2 - pdiam / 2,
  x1: N / 2 + pdiam / 2,
  y1: N / 2 + pdiam / 2,
  line: {
    color: "rgba(255, 255, 255, 0.5)",
    width: 1,
  },
});

/**
 * Common Plotly layout for scientific phase maps
 * Ensures correct display conventions (origin='lower', transpose, zoom)
 */
export const createPhaseMapLayout = (
  N: number,
  pdiam: number,
  title: string,
  height: number = 350
) => {
  const [zoomMin, zoomMax] = getPupilZoomBounds(N, pdiam);

  return {
    title: {
      text: title,
      font: { size: 13 },
    },
    xaxis: {
      title: "",
      scaleanchor: "y" as any,
      scaleratio: 1,
      range: [zoomMin, zoomMax],
      showticklabels: false,
    },
    yaxis: {
      title: "",
      autorange: "reversed" as const,
      range: [zoomMin, zoomMax],
      showticklabels: false,
    },
    shapes: [createPupilCircleShape(N, pdiam)],
    width: undefined,
    height,
    margin: { l: 10, r: 10, t: 30, b: 10 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
  };
};
