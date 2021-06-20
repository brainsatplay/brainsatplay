// Robot Test
var robot = require("robotjs");

class RobotManager{
    constructor(){
        this.screenSize = robot.getScreenSize();   
    }

    move(command){
        let mouse = robot.getMousePos();
        robot.moveMouse(mouse.x + command.x, mouse.y + command.y);
        return robot.getMousePos();
    }

    set(command){
        robot.moveMouse(command.x, command.y);
    }

    click(){
        robot.mouseClick();
    }

    type(keys){
        keys.forEach(k => {
            robot.keyTap(k);
        })
    }

    pixel(){
        var mouse = robot.getMousePos();
        return robot.getPixelColor(mouse.x, mouse.y);
    }
}

module.exports = RobotManager