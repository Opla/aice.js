/* eslint-disable no-param-reassign */
/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class OutputRendererSlotFilling {
  constructor() {
    this.slots = {};
  }

  createSlot(intentid, slot) {
    if (!this.slots[intentid]) {
      this.slots[intentid] = [slot];
    } else {
      this.slots[intentid].push(slot);
    }
  }

  wasInSlot(context) {
    return !!(this.slots && context && context.slotfilling);
  }

  hasSlots(intentid) {
    return Boolean(this.slots[intentid]);
  }

  setSlotFillingIntent(intent, context, entities) {
    if (!context.slotfilling || !context.slotfilling.filledslots) {
      // eslint-disable-next-line no-param-reassign
      context.slotfilling = { filledslots: {}, intent };
    }
    // eslint-disable-next-line no-param-reassign
    entities.forEach(e => {
      const matchingEntitySlot = this.slots[intent.intentid].find(s => s.entity.name === e.name);
      if (matchingEntitySlot) {
        // eslint-disable-next-line no-param-reassign
        context.slotfilling.filledslots[matchingEntitySlot.name] = e;
      }
    });
  }

  async process(intent, entities, context) {
    if (this.wasInSlot(context)) {
      entities.forEach(e => {
        const matchingEntitySlot = this.slots[context.slotfilling.intent.intentid].find(s => s.entity.name === e.name);
        if (matchingEntitySlot) {
          // eslint-disable-next-line no-param-reassign
          context.slotfilling.filledslots[matchingEntitySlot.name] = e;
        }
      });
    } else if (this.hasSlots(intent.intentid)) {
      this.setSlotFillingIntent(intent, context, entities);
    } else {
      return undefined;
    }
    if (context.slotfilling && context.slotfilling.intent.intentid) {
      const unsatisfiedSlots = this.slots[context.slotfilling.intent.intentid]
        .map(e => {
          if (context.slotfilling.filledslots[e.name]) {
            return null;
          }
          return e;
        })
        .filter(v => v);

      if (unsatisfiedSlots && unsatisfiedSlots.length > 0) {
        return {
          intentid: context.slotfilling.intent.intentid,
          renderResponse: unsatisfiedSlots[0].answer,
          score: 1,
          context,
          entity: unsatisfiedSlots[0].entity.name,
        };
      }

      const res = { intentid: context.slotfilling.intent.intentid, score: 1.0, context };
      // eslint-disable-next-line no-param-reassign
      context.slotfilling = null;
      return res;
    }
    return undefined;
  }
}

module.exports = { OutputRendererSlotFilling };
