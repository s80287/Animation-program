const fs = require('fs');
const { randomInt, randomFloat } = require('crypto');

// Initialize variables
let timestamp = 0.0;
const commands = ["moveTo", "rotate", "scale"];
const objects = ["object1", "object2"];

// Open file for writing
const file = fs.createWriteStream("animation.txt");

for (let i = 0; i < 1000; i++) {
    // Increment timestamp by a random small value
    //timestamp += Math.round((Math.random() * (0.5 - 0.1) + 0.1) * 10) / 10;
    
    // range from 1.0 to 2.0, two decimal places
    timestamp += Number((Math.random() + 1).toFixed(2));

    // Select random object and command
    const obj = objects[randomInt(0, objects.length)];
    const command = commands[randomInt(0, commands.length)];
    
    // Generate parameters based on command
    let params;
    if (command === "moveTo") {
        params = `${randomInt(0, 251)}, ${randomInt(0, 251)}, ${randomInt(0, 251)}`;
    } else if (command === "rotate") {
        params = `${randomInt(0, 361)}, ${randomInt(0, 361)}, ${randomInt(0, 361)}`;
    } else if (command === "scale") {
        params = `${(Math.random() * (2.0 - 0.5) + 0.5).toFixed(1)}, ${(Math.random() * (2.0 - 0.5) + 0.5).toFixed(1)}, ${(Math.random() * (2.0 - 0.5) + 0.5).toFixed(1)}`;
    }
    
    // Write to file
    file.write(`time ${timestamp}\n`);
    file.write(`${obj}.${command}(${params})\n`);
}

// Close the file
file.end();