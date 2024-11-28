# Animation Commands Guide

This guide explains how to use the commands `create()`, `moveTo()`, `scale()`, `remove()`, and `rotate()` in the `animation.txt` file to control 3D objects in the scene.

## Prerequisites

Ensure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

## Setup

Install the required packages:
    ```sh
    npm install three vite
    ```

## Running the Project

1. Start the Vite development server:
    ```sh
    npx vite
    ```

2. Vite will automatically open your default browser. Click on "Select Directory" and choose the directory of the animation files.

3. Choose the txt file you wish to display. It will then be displayed on the screen.

## Command Syntax (in file "animation.txt")

### 1. create(modelFileName)
Creates a new 3D object from the specified model file and adds it to the scene.

**Syntax:**
```
objectName=create(modelFileName)
```

**Example:**
```
cube=create(box.3ds)
```

### 2. moveTo(x, y, z)
Moves the specified object to the given coordinates smoothly.

**Syntax:**
```
objectName.moveTo(x, y, z)
```

**Example:**
```
cube.moveTo(10, 20, 30)
```

### 3. scale(x, y, z)
Scales the specified object by the given factors along the x, y, and z axes.

**Syntax:**
```
objectName.scale(x, y, z)
```

**Example:**
```
cube.scale(2, 2, 2)
```

### 4. remove()
Removes the specified object from the scene.

**Syntax:**
```
objectName.remove()
```

**Example:**
```
cube.remove()
```

### 5. rotate(x, y, z)
Rotates the specified object by the given angles (only in degrees) around the x, y, and z axes.

**Syntax:**
```
objectName.rotate(x, y, z)
```

**Example:**
```
cube.rotate(0, 30, 0)
```

## Timing Commands

You can specify the time at which a command should be executed using the [`time`] keyword.

**Syntax:**
```
time seconds
command
```

**Example:**
```
time 0
cube=create(box.3ds)

time 2
cube.moveTo(10, 20, 30)

time 4
cube.scale(2, 2, 2)

time 6
cube.rotate(0, 30, 0)

time 8
cube.remove()
```

This example will:
1. Create a cube at time 0.
2. Move the cube to coordinates (10, 20, 30) at time 2 seconds.
3. Scale the cube by a factor of 2 along all axes at time 4 seconds.
4. Rotate the cube 30 degrees around the y-axis at time 6 seconds.
5. Remove the cube from the scene at time 8 seconds.

## Options

### Change the speed of animation

Press '+'/'-' to make the animation faster/slower

### Pause and resume animation

Press 'p' to pause and resume the animation

### Refresh

Press 'F5' to refresh the browser