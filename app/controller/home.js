'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async ifLogined() {
    this.ctx.body = {
      status: 1
    }
  }
}

module.exports = HomeController;
