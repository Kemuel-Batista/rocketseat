import UIKit

var nameVar: String = "Kemuel"
let nameConstant: String = "Kemuel"

nameVar = "Batista"
// nameConstant = "Batista" -> GENERATE AN ERROR

class Car {
  var carName: String
  var engine: String
  var numberOfWheels: Int
  var numberOfPassengers: Int
  var wheelHeight: Int?
  
  init(carName: String, engine: String, numberOfWheels: Int, numberOfPassengers: Int, wheelHeight: Int? = nil) {
    self.carName = carName
    self.engine = engine
    self.numberOfWheels = numberOfWheels
    self.numberOfPassengers = numberOfPassengers
    self.wheelHeight = wheelHeight
  }
  
  public func getNumberOfPassengers() -> Int {
    return numberOfPassengers
  }
}

let fordKa: Car = Car(carName: "Ford Ka", engine: "1.5L", numberOfWheels: 4, numberOfPassengers: 5)
fordKa.getNumberOfPassengers()

let golf: Car = Car(carName: "Golf", engine: "1.5", numberOfWheels: 4, numberOfPassengers: 5, wheelHeight: 17)

//if (fordKa.wheelHeight == golf.wheelHeight) {
//  print("The wheels are equals")
//} else {
//  print("Impossible to compare")
//}

if let wheelHeightFordKa = fordKa.wheelHeight, let wheelHeightGolf = golf.wheelHeight {
  if wheelHeightFordKa == wheelHeightGolf {
    print("The wheels are equals")
  } else {
    print("Impossible to compare")
  }
} else {
  print("uma das variaveis n existem")
}

func findWheelHeight(car: Car) -> Int {
  // used a lot in companies
  // will be created if the condition is good
  guard let wheelHeightCar = car.wheelHeight else {
    print("There is no wheel height for this car")
    return 0
  }
    
  return wheelHeightCar
}

findWheelHeight(car: fordKa)
