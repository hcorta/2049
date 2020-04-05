'use strict'

// Models
import { Cloud, Obstacle } from './index.mjs'

// Constants
import { CLOUD, OBSTACLE, KEYS } from '../constants/index.mjs'

// Config
import { config } from '../config/index.mjs'

// Utils
import { utils } from '../utils/index.mjs'

export class World {
  constructor ({
    ctx,
    canvas,
    position,
    perspectiveOrigin,
    config
  }) {
    this.ctx = ctx
    this.canvas = canvas
    this.config = config
    this.obstacles = []
    this.clouds = []
    this.board = null
    this.sun = null
    this.pressedKey = null
    this.position = { x: 0, y: 0 }
    this.perspectiveOrigin = {
      x: canvas.width / 2,
      y: canvas.height / 2
    }
  }

  setListeners = () => {
    addEventListener('keydown', ({ key }) => {
      this.pressedKey = key
    }, true)

    addEventListener('keyup', () => {
      this.pressedKey = null
      this.position = { x: 0, y: 0 }
      this.perspectiveOrigin = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      }
    }, true)
  }

  setIntervals = () => {
    setInterval(this.onKeyPress, 10)

    setInterval(() => {
      if (this.obstacles.length < this.config.obstacle.limit) {
        this.addItem(OBSTACLE)
      }
    }, this.config.obstacle.interval)

    setInterval(() => {
      if (this.clouds.length < this.config.cloud.limit) {
        this.addItem(CLOUD)
      }
    }, this.config.cloud.interval)
  }

  onKeyPress = () => {
    switch (this.pressedKey) {
      case KEYS.LEFT: {
        this.position = {
          ...this.position,
          x: this.position.x - 100
        }
        this.perspectiveOrigin = {
          ...this.perspectiveOrigin,
          x: this.perspectiveOrigin.x - 0.1
        }
        break
      }

      case KEYS.RIGHT: {
        this.position = {
          ...this.position,
          x: this.position.x + 100
        }
        this.perspectiveOrigin = {
          ...this.perspectiveOrigin,
          x: this.perspectiveOrigin.x + 0.1
        }
        break
      }

      case KEYS.UP: {
        this.position = {
          ...this.position,
          y: this.position.y + 1
        }
        break
      }

      case KEYS.DOWN: {
        this.position = {
          ...this.position,
          y: this.position.y - 1
        }
        break
      }
    }
  }

  addItem = type => {
    switch (type) {
      case OBSTACLE: {
        this.obstacles = [
          new Obstacle({
            ctx: this.ctx,
            canvas: this.canvas,
            ...this.config.obstacle,
            ...utils.generateObstacle()
          }),
          ...this.obstacles
        ]
        break
      }

      case CLOUD : {
        this.clouds = [
          new Cloud({
            ctx: this.ctx,
            canvas: this.canvas,
            ...utils.generateCloud()
          }),
          ...this.clouds
        ]
        break
      }

      default: {
        throw new Error('ITEM TYPE NOT SPECIFIED')
      }
    }
  }

  update = () => {
    const { position, perspectiveOrigin } = this
    const obstacles = []
    const clouds = []

    const length = this.obstacles.length > this.clouds.length
      ? this.obstacles.length
      : this.clouds.length

    for (let i = 0; i < length; i++) {
      if (this.obstacles[i] && (this.obstacles[i].position.y > 0)) {
        this.obstacles[i].update({ position, perspectiveOrigin })
        obstacles.push(this.obstacles[i])
      }

      if (this.clouds[i] && this.clouds[i].d.y + this.clouds[i].length > 0) {
        this.clouds[i].update({ position, perspectiveOrigin })
        clouds.push(this.clouds[i])
      }
    }

    this.obstacles = obstacles
    this.clouds = clouds
  }

  render = () => {
    this.clouds.forEach(cloud => cloud.render())
    this.obstacles.forEach(obstacle => obstacle.render())
  }

  start = () => {
    this.setListeners()
    this.intervals = this.setIntervals()
  }
}
