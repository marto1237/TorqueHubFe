export async function predictCarPrice(carDetails) {
  try {
    const { 
      year, manufacturer, model, condition, cylinders, fuel, 
      odometer, transmission, drive, type, paint_color, state 
    } = carDetails;

    

    // Create an object to hold query parameters
    let queryParams = {};

    // Only include parameters with values
    if (manufacturer) queryParams.brand = manufacturer;
    if (model) queryParams.model = model;
    if (year) queryParams.min_year = year;
    if (odometer) queryParams.max_odometer = odometer;
    if (fuel) queryParams.fuel_type = fuel;
    if (transmission) queryParams.transmission = transmission;
    if (condition) queryParams.condition = condition;
    if (state) queryParams.state = state;

    // Construct the query string
    const queryString = new URLSearchParams(queryParams).toString();

    const response = await fetch(`http://127.0.0.1:5000/filter_cars?${queryString}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Something went wrong calling the AI model.');
  }
}
