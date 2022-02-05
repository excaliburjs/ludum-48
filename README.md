# :warning: Important Note for future explorers

If you’re looking for good examples of how to build games in Excalibur, please visit the [official sample gallery](https://excaliburjs.com/samples/).

We don’t recommend using this game’s source code as an example for your own work
- it was built quickly during a game jam; the code likely cuts a few corners and is a bit messy in some places
- the version of Excalibur it's using is out-of-date; the API has likely changed, and there are newer, better design patterns for building games using the Excalibur engine.

If you’d like to explore for curiosity’s sake, go on ahead, and good luck!

*- the Excalibur.js team*

---

## Ludum Dare 48

### Prequisites:

- NodeJS
- Git

### Local Dev

Updating your local copy with `git pull -r` to rebase your local commits on top of upstream, makes the `main` easy to follow and merges less cray.

1. Clone the repo

        git clone https://github.com/excaliburjs/ludum-48.git

2. Navigate into the root directory `ludum-48` in your favorite command line tool

3. Run the install to download the tools

        npm install

4. Run the following (only needed once or if the submodule is changed) commands to setup the git submodule

        git submodule init
        git submodule update

5. Build excalibur (takes a while the first time). This only needs to be re run if core excalibur changes.

        npm run build:excalibur

6. Build the project

        npm run build

7. Run the game locally with parcel

        npm start
