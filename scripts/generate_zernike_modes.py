#!/usr/bin/env python3
"""
Generate Zernike mode shape images (Z1-Z55) as PNG files
for display in the frontend ZernikeBarChart component.

Usage:
    cd /Users/thomas/Dev/perso/phase-diversity
    python scripts/generate_zernike_modes.py
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt

# Add backend to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from app.core import zernike as zer
except ImportError:
    print("Error: Could not import zernike module from backend/app/core/")
    print("Make sure you're running this from the project root and backend is set up.")
    sys.exit(1)

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'zernike-modes')
IMAGE_SIZE = 256  # 256x256 pixels
DPI = 100
MAX_MODE = 55  # Generate Z1 to Z55

def generate_mode_shape(mode_index, size=IMAGE_SIZE):
    """
    Generate a 2D Zernike mode shape for a given mode index (Noll convention).

    Args:
        mode_index: int, Zernike mode number (1-based, Noll indexing)
        size: int, image size in pixels

    Returns:
        2D numpy array with Zernike values, NaN outside unit circle
    """
    # Create coordinate grid
    x = np.linspace(-1, 1, size)
    y = np.linspace(-1, 1, size)
    X, Y = np.meshgrid(x, y)

    # Polar coordinates
    R = np.sqrt(X**2 + Y**2)
    Theta = np.arctan2(Y, X)

    # Compute Zernike mode
    Z = zer.zer(R, Theta, mode_index)

    # Mask outside unit circle
    Z[R > 1.0] = np.nan

    return Z

def get_mode_name(index):
    """Get common name for Zernike mode (Noll indexing)"""
    names = {
        1: "Piston",
        2: "Tip (vert tilt)",
        3: "Tilt (horiz tilt)",
        4: "Defocus",
        5: "Oblique astig.",
        6: "Vertical astig.",
        7: "Vertical coma",
        8: "Horizontal coma",
        9: "Vertical trefoil",
        10: "Oblique trefoil",
        11: "Primary spherical",
        12: "Vert. 2nd astig.",
        13: "Obliq. 2nd astig.",
        14: "Vert. quadrafoil",
        15: "Obliq. quadrafoil",
        16: "Vert. 2nd coma",
        17: "Horiz. 2nd coma",
        18: "Vert. 2nd trefoil",
        19: "Obliq. 2nd trefoil",
        20: "Pentafoil",
        21: "Obliq. pentafoil",
    }
    return names.get(index, f"Mode {index}")

def save_mode_image(mode_index, Z, output_dir):
    """
    Save Zernike mode as PNG with colorbar.

    Args:
        mode_index: int, mode number
        Z: 2D array, Zernike values
        output_dir: str, output directory path
    """
    fig, ax = plt.subplots(figsize=(4, 4), dpi=DPI)

    # Plot with RdBu_r colormap (red-blue reversed)
    im = ax.imshow(Z.T, origin='lower', cmap='RdBu_r',
                   interpolation='nearest', aspect='equal')

    # Remove axes
    ax.axis('off')

    # Add colorbar
    cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.ax.tick_params(labelsize=8)

    # Save
    filename = f'Z{mode_index:02d}.png'
    filepath = os.path.join(output_dir, filename)
    plt.savefig(filepath, bbox_inches='tight', pad_inches=0.1,
                facecolor='white', edgecolor='none')
    plt.close(fig)

    return filename

def main():
    """Generate all Zernike mode shapes Z1-Z55"""

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating Zernike mode shapes (Z1-Z{MAX_MODE})...")
    print(f"Output directory: {OUTPUT_DIR}")
    print()

    for i in range(1, MAX_MODE + 1):
        try:
            # Generate mode shape
            Z = generate_mode_shape(i)

            # Save as PNG
            filename = save_mode_image(i, Z, OUTPUT_DIR)

            # Get mode name
            mode_name = get_mode_name(i)

            print(f"  ✓ Generated {filename} - {mode_name}")

        except Exception as e:
            print(f"  ✗ Error generating Z{i:02d}: {e}")

    print()
    print(f"Done! Generated {MAX_MODE} Zernike mode images.")
    print(f"Total size: {sum(os.path.getsize(os.path.join(OUTPUT_DIR, f)) for f in os.listdir(OUTPUT_DIR) if f.endswith('.png')) / 1024 / 1024:.2f} MB")

if __name__ == '__main__':
    main()
