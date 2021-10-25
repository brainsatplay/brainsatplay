export const dragElement = (container, dragItem, context, onMove, onDown,onUp) => {
    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;
    var defaultScale = 0.5

    // container.addEventListener("touchstart", dragStart, false);
    // container.addEventListener("touchend", dragEnd, false);
    // container.addEventListener("touchmove", drag, false);

    container.addEventListener("mousedown", dragStart, false);
    container.addEventListener("mouseup", dragEnd, false);
    container.addEventListener("mousemove", drag, false);

    let transform = dragItem.style.cssText.match(/transform: ([^;].+);\s?/)
    if (transform) transform = transform[1]
    
    if (transform) {
      let scale = transform.match(/scale\(([^\)].+)\)\s?/)
      if (scale) scale = scale[1]
      else scale = 1

      let translateString = transform.match(/translate3d\(([^\)].+)\)\s?/)
      if (translateString){
        let arr = translateString[1].split(',')
        xOffset = arr[0].split('px')[0]
        yOffset = arr[1].split('px')[0]
      }
    } else {
      dragItem.style.transform = `scale(${defaultScale})`;
    }

    function dragStart(e) {

      if (e.type === "touchstart") {
        initialX = (e.touches[0].clientX - (context.scale*defaultScale)*xOffset);
        initialY = (e.touches[0].clientY - (context.scale*defaultScale)*yOffset);
      } else {
        initialX = (e.clientX - (context.scale*defaultScale)*xOffset);
        initialY = (e.clientY - (context.scale*defaultScale)*yOffset);
      }

      // Account For Nested Control Objects
      if (e.target === dragItem || (dragItem.contains(e.target) && !e.target.classList.contains('node-port'))) {
        active = true;
        onDown()
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;

      active = false;
      onUp()
    }

    function drag(e) {
      if (active) {
      
        e.preventDefault();
      
        if (e.type === "touchmove") {
          currentX = (e.touches[0].clientX - initialX)/(context.scale*defaultScale);
          currentY = (e.touches[0].clientY - initialY)/(context.scale*defaultScale);
        } else {
          currentX = (e.clientX - initialX)/(context.scale*defaultScale);
          currentY = (e.clientY - initialY)/(context.scale*defaultScale);
        }

        xOffset = currentX;
        yOffset = currentY;

          setTranslate(xOffset, yOffset, dragItem);
          onMove()
      }
    }

    function setTranslate(xPos, yPos, el) {

      // Add default scale
      el.style.transform = `scale(${defaultScale}) translate3d(${xPos}px,${yPos}px, 0)`;
    }
}