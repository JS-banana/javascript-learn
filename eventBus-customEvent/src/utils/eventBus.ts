import {EventEmitter} from 'events'

// 保证唯一实例
const EventBus=new EventEmitter()

export default EventBus