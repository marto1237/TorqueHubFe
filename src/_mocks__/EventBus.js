const EventBus = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };
  
  export default EventBus;