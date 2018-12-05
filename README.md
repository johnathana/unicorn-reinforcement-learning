# unicorn-reinforcement-learning

##### Deep reinforcement learning for the toggl's Unicorn Startup Simulator

https://toggl.com/startup-simulator/

This project uses the excellent [ConvNetJS](https://github.com/karpathy/convnetjs) javascript library for training the neural network entirely in the browser.

The trained network has 80% plus win rate.



#### Instructions

To run the trained network:

* Visit the https://toggl.com/startup-simulator
* Open the *Develop Tools* and choose the *Console* tab
* Copy and paste the content of *agent-play.js* in the console

The agent will start to answer the questions every 3 seconds.

![Training](https://raw.githubusercontent.com/johnathana/unicorn-reinforcement-learning/master/unicorn-rl.gif "Training")

To train the network you can follow the same steps but instead use the *agent-train.js* file. 
The training can take a lot of time depending on your hardware. After the training finishes a 1000 game evaluation will follow. 
Finally the trained network will be copied in your clipboard. You can paste it in a file for further use.
