import img from './feature.png'

export const settings = {
    "name": "Sensorium",
    "devices": ["EEG","HEG"],
    "author": "Joshua Brewster",
    "description": "Audiovisual feedback, with friends! (WIP)",
    "categories": ["train"],
    "module": "SensoriumApplet",
		"instructions":`
      <p>Dynamic biofeedback & audio renderer!</p>
      <h3>Quick Start:</h3>
      <p>
        Add an available effect via the Effect dropdown menu, connect the corresponding device, then watch the visuals and listen to the corresponding audio volumes change!<br><br>
        For Audio visualization select "Audio FFT" effect, your microphone will automatically contribute to visuals. <br>
      </p>
      <h4>Live Editing</h4>
      <p>
        Our shader system comes with a fully functional editor and parser for the fragment shaders, leveraging ThreeJS.<br><br>
        Using the reference table, you can create your own responsive feedback on the fly or modify other shaders to work with our system. We will expand on the possibilities as time goes on. <br><br>
        When you save, the shader will be automatically compiled and if the screen isn't black it worked! You can see GLSL errors in the console with F12.

      </p>
    `,
    "image":img,
    "analysis": ['eegcoherence'],
    "intro": {
      title: false
    }
}
