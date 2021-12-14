// ECS
import { Component, System, Types } from "ecsy";
import { ECSYThreeWorld } from "ecsy-three";
import {
  Egg,
  ControllableBasket,
  Moving,
  Hearts,
  FloatingCloud,
} from "./Components";
import {
  BasketMoveSystem,
  MoveSystem,
  EggCollisionSystem,
  CloudFloatingSystem,
} from "./Systems";

// THREE
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Utility
import Stats from "three/examples/jsm/libs/stats.module";
import { gui, GUI } from "three/examples/jsm/libs/dat.gui.module";

class Game {
  /**
   *
   * @param { DOMElement } canvas - <canvas> element to render to
   */

  constructor(canvas) {
    let self = this;
    this.canvas = canvas;

    this._settings = {
      debug: false,
      shadows: {
        ON: true,
        shadowmapSize: 1024,
      },
      displaySize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      game: {
        playerSpeed: 48,
        startingHearts: 6,
        boundries: {
          minX: -4.5,
          maxX: 4,
          minY: 5,
          maxY: 7,
        },
        eggs: {
          white: 1,
          orange: 2,
          pink: 3,
          blue: 4,
          purple: 5,
          red: 6,
          green: 7,
          brown: 8,
          silver: 9,
          gold: 10,
          black: -50,
        },
        startingEggVelocity: 1,
        eggVelocityAcceleration: 0.04,
        clouds: {
          boundries: {
            min: {
              x: -11,
              y: 5,
            },
            max: {
              x: 15,
              y: 6.5,
            },
          },
          speed: 0.3,
          speedVariation: 0.4,
          respawnRange: 4,
        },
        rabbit: {
          animationCD: 2, // seconds
          animationRandom: 2, // seconds
        },
      },
    };

    this._playing = false;
    this._basket = null;
    this._heartsContaine = null;
    this._rabbit = null;
    this._eggs = [];

    // ECS
    this._world = new ECSYThreeWorld({
      entityPoolSize: 100,
    });
    this._world
      .registerComponent(Egg)
      .registerComponent(ControllableBasket)
      .registerComponent(Hearts)
      .registerComponent(FloatingCloud)
      .registerComponent(Moving);
    this._world
      .registerSystem(BasketMoveSystem)
      .registerSystem(MoveSystem)
      .registerSystem(CloudFloatingSystem)
      .registerSystem(EggCollisionSystem);

    this._world.getSystem(BasketMoveSystem).stop();
    this._world.getSystem(MoveSystem).stop();
    this._world.getSystem(EggCollisionSystem).stop();

    if (this._settings.debug) {
      //Stats
      this._stats = new Stats();
      document.body.appendChild(this._stats.dom);

      //GUI
      this._gui = new GUI();
    }

    // Renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
    });
    this._renderer.setSize(
      this._settings.displaySize.width,
      this._settings.displaySize.height
    );
    if (this._settings.shadows.ON) {
      this._renderer.shadowMap.enabled = true;
      this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.physicallyCorrectLights = true;
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 2.0;

    if (this._settings.debug)
      this._gui.add(this._renderer, "toneMappingExposure", 0.0, 3.0, 0.05);

    // Scene
    this._scene = this._world
      .createEntity()
      .addObject3DComponent(new THREE.Scene()); // scene is the root Object3d and has no parent

    // this._scene.getObject3D().background = new THREE.Color(0xEDFCFF);

    // Camera
    this._camera = new THREE.PerspectiveCamera(
      16,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    if (window.innerWidth < 992) {
      this._camera = new THREE.PerspectiveCamera(
        77,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      // this._camera.position.set(-0.8, 3.7, 16.7);
    }
    // this._camera.position.set( 0, 3.5, 13 );
    // this._camera.position.set(0, 2.8, 15.7);
    // this._camera.position.set(-0.3, 3, 15.7);

    this._camera.position.set(-0.8, 2.7, 16.7);
    //i z 22 do 24

    // Clock
    this._clock = new THREE.Clock();

    // Loaders
    this._textureLoader = new THREE.TextureLoader();
    this._gltfLoader = new GLTFLoader();
    this.loaded = false;

    this._models = {};

    // Resize Event
    // window.addEventListener("resize", () => this._onWindowResize(), false);

    THREE.DefaultLoadingManager.onLoad = () => {
      console.log("Loading Complete!");
      this.loaded = true;
      this._addModels();
    };

    // Inits
    this._loadModels();
    this._initLights();

    this._animate();

    // Debug
    // setInterval( () => {
    //     console.log( 'Draw calls:', this._renderer.info.render.calls );
    // }, 1000/2 );

    // document.addEventListener('keydown', ( evt ) => {
    //     if (evt.key === 'l') {
    //         console.log( this._camera.position );
    //     } else {
    //         console.log( evt );
    //     }
    // })
  }

  getScore() {
    return this._basket.getComponent(ControllableBasket).score;
  }

  start() {
    if (this.loaded) {
      this._playing = true;
      this._clock.start();
      this._basket.getMutableComponent(ControllableBasket).score = 0;
      this._basket.getMutableComponent(ControllableBasket).lives =
        this._settings.game.startingHearts;
      this._fillHeartsContainer();
      this._resetEggsPositions();
      this._world.getSystem(BasketMoveSystem).play();
      this._world.getSystem(MoveSystem).play();
      this._world.getSystem(EggCollisionSystem).play();
    } else {
      console.warn("Models not loaded yet!");
    }

    this._initControls();

    // gsap.to(this._basket.getObject3D().position, {
    //   x: 0,
    //   y: 1.35,
    //   z: 0,
    //   duration: 1,
    // });

    gsap.to(this._camera, {
      fov: 22,

      duration: 1,
      onUpdate: () => {
        this._camera.updateProjectionMatrix();
      },
    });

    gsap.to(this._camera.position, {
      x: -0.3,
      y: 3,
      z: 15.7,
      duration: 1,
    });

    let proportions = window.innerWidth / window.innerHeight;
    if (proportions > 0.9 && proportions < 1.35) {
      gsap.to(this._camera, {
        fov: 35,

        duration: 1,
        onUpdate: () => {
          this._camera.updateProjectionMatrix();
        },
      });

      gsap.to(this._camera.position, {
        x: -0.3,
        y: 4,
        z: 15.7,
        duration: 1,
      });

      this._heartsContainer.getObject3D().position.set(-4.5, 5.7, 0);
    }

    if (window.innerWidth < 992) {
      gsap.to(this._camera, {
        fov: 75,

        duration: 1,
        onUpdate: () => {
          this._camera.updateProjectionMatrix();
        },
      });

      // this._camera.position.set(-0.8, 2.7, 16.7);

      gsap.to(this._camera.position, {
        x: -1.1,
        y: 2.5,
        z: 16.5,
        duration: 1,
      });

      this._heartsContainer.getObject3D().position.set(-4.1, 4.7, 2);
    }
    // this._basket.getObject3D().position.set(0, 1.35, 0.0);
  }

  stop() {
    this._playing = false;
    this._clock.stop();
    this._world.getSystem(BasketMoveSystem).stop();
    this._world.getSystem(MoveSystem).stop();
    this._world.getSystem(EggCollisionSystem).stop();

    gsap.to(this._basket.getObject3D().position, {
      x: 0,
      y: 0.75,
      z: 0,
      duration: 1,
    });

    gsap.to(this._camera, {
      fov: 18,
      duration: 1,
      onUpdate: () => {
        this._camera.updateProjectionMatrix();
      },
    });

    gsap.to(this._camera.position, {
      x: -0.8,
      y: 2.7,
      z: 16.7,
      duration: 1,
    });
  }

  _loadModels() {
    const ext = ".gltf";
    const path = "models/";
    const urls = [
      "chmurka1",
      "chmurka2",
      "chmurka3",
      "drzewo",
      "heart",
      "jajko",
      "koszyczek",
      "krolik",
      "krzaczek1",
      "krzaczek2",
      "krzaczek3",
      "krzaczek4",
      "trawa",
    ];

    // const loadAndAssign = (url) => {
    //     this._gltfLoader.load(path + url + ext, (gltf) => {
    //         gltf.scene.traverse((child) => {
    //             if (this._settings.shadows.ON && child.isMesh) {
    //                 child.receiveShadow = child.castShadow = true;
    //             }
    //         });
    //         this._models[url] = gltf.scene;
    //     });
    // }

    urls.forEach((url) => {
      this._gltfLoader.load(path + url + ext, (gltf) => {
        gltf.scene.traverse((child) => {
          if (this._settings.shadows.ON && child.isMesh) {
            child.receiveShadow = child.castShadow = true;
          }
        });
        gltf.scene.animations = gltf.animations;
        this._models[url] = gltf.scene;
      });
    });
  }

  _addModels() {
    // console.log( 'this._models', this._models );

    for (let key in this._models) {
      const model = this._models[key];

      if (key.includes("krolik")) {
        const entity = this._world
          .createEntity()
          .addObject3DComponent(model, this._scene);

        this._rabbit = entity.getObject3D();
        this._rabbit.position.set(-6, 1.66, -0.6);

        this._rabbit.mixer = new THREE.AnimationMixer(this._rabbit);
        const clip = THREE.AnimationClip.findByName(
          this._rabbit.animations,
          "Uszka"
        );
        const uszkaAction = this._rabbit.mixer.clipAction(clip);
        this._rabbit.actions = {
          uszka: uszkaAction,
        };
        this._rabbit.actions.uszka.loop = THREE.LoopOnce;
        this._rabbit.actions.uszka.timeScale = 1; // Speed up or slow down the animation
        // this._rabbit.actions.uszka.play();

        const animCD = this._settings.game.rabbit.animationCD;
        const animRandom = this._settings.game.rabbit.animationRandom;

        const animationLoop = () => {
          // Loop to play the animation once every few seconds
          setTimeout(() => {
            this._rabbit.actions.uszka.reset();
            this._rabbit.actions.uszka.play();
            animationLoop();
          }, (animCD + animRandom * Math.random()) * 1000);
        };
        animationLoop();
      } else if (key.includes("koszyczek")) {
        const entity = this._world
          .createEntity()
          .addObject3DComponent(model, this._scene);
        entity.addComponent(ControllableBasket, {
          speed: this._settings.game.playerSpeed,
          input: {
            left: false,
            right: false,
          },
          boundries: {
            minX: this._settings.game.boundries.minX,
            maxX: this._settings.game.boundries.maxX,
          },
          score: 0,
          lives: this._settings.game.startingHearts,
        });
        this._basket = entity;
        entity.getObject3D().position.set(0, 0.75, 0.0);
      } else if (key.includes("heart")) {
        this._heartsContainer = this._world
          .createEntity()
          .addObject3DComponent(new THREE.Object3D(), this._scene);
        this._heartsContainer.addComponent(Hearts);
        // this._heartsContainer.getObject3D().position.set( -4, 4.7, 0 );
        this._heartsContainer.getObject3D().position.set(-4.5, 4.7, 0);
        if (window.innerWidth < 1300) {
          this._heartsContainer.getObject3D().position.set(-3, 4.7, 0);
        }
        // mniej x -> bardziej w prawo
      }
      // else if (key.includes('drzewo')) {
      //     this.position.set(-5, 4.7, 0);

      // }
      else if (key.includes("jajko")) {
        for (let key in this._settings.game.eggs) {
          const eggEntity = this._world
            .createEntity()
            .addObject3DComponent(model.children[0].clone(), this._scene);

          eggEntity.addComponent(Moving, {
            direction: new THREE.Vector3(0, -1, 0),
            velocity: this._settings.game.startingEggVelocity,
            acceleration: this._settings.game.eggVelocityAcceleration,
            boundries: {
              min: new THREE.Vector3(this._settings.game.boundries.minX, 0, -1),
              max: new THREE.Vector3(this._settings.game.boundries.maxX, 10, 1),
            }, // 10
            respawnRange: 60,
          });
          eggEntity.addComponent(Egg, {
            points: this._settings.game.eggs[key],
          });

          eggEntity.getObject3D().material = model.children[0].material.clone();
          eggEntity.getObject3D().material.color.set(key);

          this._eggs.push(eggEntity);
        }
      } else if (key.includes("chmurka")) {
        const cloudEntity = this._world
          .createEntity()
          .addObject3DComponent(model, this._scene);
        const boundries = this._settings.game.clouds.boundries;
        const respawnRange = this._settings.game.clouds.respawnRange;
        cloudEntity.addComponent(FloatingCloud, {
          direction: new THREE.Vector3(1, 0, 0),
          velocity:
            this._settings.game.clouds.speed +
            this._settings.game.clouds.speedVariation * Math.random(),
          boundries: boundries,
          respawnRange: respawnRange,
        });

        model.position.z = -5;
        model.position.y =
          boundries.min.y + (boundries.max.y - boundries.min.y) * Math.random();
        model.position.x =
          boundries.min.x +
          respawnRange +
          (boundries.max.x - respawnRange - (boundries.min.x + respawnRange)) *
            Math.random();
      } else {
        const entity = this._world
          .createEntity()
          .addObject3DComponent(model, this._scene);
      }
    }

    this._resetEggsPositions();
  }

  _fillHeartsContainer() {
    const model = this._models["heart"];

    for (let i = 0; i < this._settings.game.startingHearts; i++) {
      const heart = this._world
        .createEntity()
        .addObject3DComponent(model.clone(), this._heartsContainer);
      const heartOffset = 0.5;
      const heartScale = 0.2;
      heart.getObject3D().position.x =
        (i - this._settings.game.startingHearts / 2) * heartOffset;
      heart.getObject3D().scale.multiplyScalar(heartScale);
    }
  }

  _resetEggsPositions() {
    this._eggs.forEach((eggEntity) => {
      const movingComponent = eggEntity.getComponent(Moving);

      eggEntity
        .getObject3D()
        .position.set(
          movingComponent.boundries.min.x +
            (movingComponent.boundries.max.x -
              movingComponent.boundries.min.x) *
              Math.random(),
          movingComponent.boundries.max.y +
            Math.random() * movingComponent.respawnRange,
          0
        );
    });
  }

  _initControls() {
    this.controls2 = new OrbitControls(this._camera, this.canvas);

    this.controls = {
      left: false,
      right: false,
    };

    const onKeyDown = (evt) => {
      // evt.preventDefault();
      changeKeyState(evt.code, true);
    };
    const onKeyUp = (evt) => {
      // evt.preventDefault();
      changeKeyState(evt.code, false);
    };

    const changeKeyState = (keyCode, trueOrFalse) => {
      const controlComponent = this._basket.getComponent(ControllableBasket);

      switch (keyCode) {
        case "ArrowLeft":
          this.controls.left = trueOrFalse;
          controlComponent.input.left = trueOrFalse;
          break;
        case "ArrowRight":
          this.controls.right = trueOrFalse;
          controlComponent.input.right = trueOrFalse;
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);

    // const onBasketButtonLeft = () => {
    //     const controlComponent = this._basket.getComponent(ControllableBasket);
    //     this.controls.left = true;
    //     controlComponent.input.left = true;
    // }

    // const onBasketButtonLeftEnd = () => {
    //     const controlComponent = this._basket.getComponent(ControllableBasket);
    //     this.controls.left = false;
    //     controlComponent.input.left = false;
    // }

    // // buttonRight = document.getElementById('btnBasketToRight');
    // const buttonLeft = document.getElementById('btnBasketToLeft');

    // buttonLeft.addEventListener('touchstart', onBasketButtonLeft, false);
    // buttonLeft.addEventListener('touchend', onBasketButtonLeftEnd, false);

    // const onBasketButtonRight = () => {
    //     const controlComponent = this._basket.getComponent(ControllableBasket);
    //     this.controls.right = true;
    //     controlComponent.input.right = true;
    // }

    // const onBasketButtonRightEnd = () => {
    //     const controlComponent = this._basket.getComponent(ControllableBasket);
    //     this.controls.right = false;
    //     controlComponent.input.right = false;
    // }

    // // buttonRight = document.getElementById('btnBasketToRight');
    // const buttonRight = document.getElementById('btnBasketToRight');

    // buttonRight.addEventListener('touchstart', onBasketButtonRight, false);
    // buttonRight.addEventListener('touchend', onBasketButtonRightEnd, false);
  }

  _initLights() {
    let lights = [];

    lights[0] = new THREE.AmbientLight(0xbaccff, 0.6);
    lights[1] = new THREE.DirectionalLight(0x9db4ff, 1.7);
    lights[1].position.set(3, 15, 20);
    lights[2] = new THREE.DirectionalLight(0xff9329, 1);

    lights[2].position.set(-3, -1, 3);

    if (this._settings.shadows.ON) {
      lights[1].castShadow = true;
      lights[1].shadow.mapSize.width = this._settings.shadows.shadowmapSize;
      lights[1].shadow.mapSize.height = this._settings.shadows.shadowmapSize;
      lights[1].shadow.camera.near = 0.1;
      lights[1].shadow.camera.far = 50;
      if (lights[1] instanceof THREE.DirectionalLight) {
        lights[1].shadow.camera.left = -30;
        lights[1].shadow.camera.bottom = -30;
        lights[1].shadow.camera.top = 30;
        lights[1].shadow.camera.right = 30;
      }
      lights[1].shadow.bias = -0.005;

      lights[1].castShadow = true;
      lights[1].shadow.mapSize.width = this._settings.shadows.shadowmapSize;
      lights[1].shadow.mapSize.height = this._settings.shadows.shadowmapSize;
      lights[1].shadow.camera.near = 0.1;
      lights[1].shadow.camera.far = 50;
      if (lights[1] instanceof THREE.DirectionalLight) {
        lights[1].shadow.camera.left = -30;
        lights[1].shadow.camera.bottom = -30;
        lights[1].shadow.camera.top = 30;
        lights[1].shadow.camera.right = 30;
      }
      lights[1].shadow.bias = -0.005;
    }

    for (let i = 0; i < lights.length; i++) {
      let light = this._world
        .createEntity()
        .addObject3DComponent(lights[i], this._scene);
    }
    // this._world.add(lights[2].target);

    if (this._settings.debug) {
      this._gui.add(lights[0], "intensity", 0.0, 4.0, 0.1);
      this._gui.add(lights[1], "intensity", 0.0, 5.0, 0.1);

      this._gui.add(lights[2].position, "x", -10, 10, 1);
      this._gui.add(lights[2].position, "y", -10, 10, 1);
      this._gui.add(lights[2].position, "z", -10, 10, 1);

      this._gui.add(lights[2].target.position, "x", -10, 10, 1);
      this._gui.add(lights[2].target.position, "y", -10, 10, 1);
      this._gui.add(lights[2].target.position, "z", -10, 10, 1);
    }

    // const helper = new THREE.DirectionalLightHelper(lights[2], 5);
    // const helperEntity = this._world.createEntity().addObject3DComponent(helper, this._scene);
  }

  _animate() {
    if (this._settings.debug) this._stats.begin();
    const delta = this._clock.getDelta();
    const elapsedTime = this._clock.elapsedTime;

    if (this.loaded) {
      this._rabbit.mixer.update(delta);
    }
    this._world.execute(delta, elapsedTime);

    this._renderer.render(this._scene.getObject3D(), this._camera);

    requestAnimationFrame(this._animate.bind(this));
    if (this._settings.debug) this._stats.end();
  }

  // _onWindowResize() {

  //     this._settings.displaySize.width = window.innerWidth;
  //     this._settings.displaySize.height = window.innerHeight;

  //     this._renderer.setSize(this._settings.displaySize.width, this._settings.displaySize.height);
  //     this._camera.aspect = this._settings.displaySize.width / this._settings.displaySize.height;
  //     this._camera.updateProjectionMatrix();
  // }
}

export { Game };
