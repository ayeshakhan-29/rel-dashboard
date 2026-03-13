export interface Driver {
  id: string;
  name: string;
  status: "available" | "on_trip" | "offline";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  vehicleType: string;
  completedTrips: number;
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
}

export interface Trip {
  id: string;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoffLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  vehicleType: string;
  passengerCount: number;
  scheduledTime: string;
  specialRequests?: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedDuration: number; // in minutes
  price: number;
}

export interface AssignmentScore {
  driver: Driver;
  score: number;
  factors: {
    proximity: number;
    availability: number;
    vehicleMatch: number;
    rating: number;
    workload: number;
  };
  estimatedArrival: number; // in minutes
}

class TripAssignmentAlgorithm {
  private drivers: Driver[] = [];
  private readonly EARTH_RADIUS = 6371; // Earth's radius in kilometers

  constructor(drivers: Driver[]) {
    this.drivers = drivers;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate estimated travel time based on distance and average speed
   */
  private calculateTravelTime(distance: number, averageSpeed: number = 40): number {
    // Average speed in km/h (considering city traffic)
    return (distance / averageSpeed) * 60; // Convert to minutes
  }

  /**
   * Calculate proximity score based on distance to pickup location
   */
  private calculateProximityScore(driver: Driver, trip: Trip): number {
    const driverLocation = driver.currentLocation || driver.location;
    const distance = this.calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      trip.pickupLocation.lat,
      trip.pickupLocation.lng
    );

    // Score decreases with distance (0-100 scale)
    const maxDistance = 50; // Maximum distance to consider (50 km)
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    return Math.max(0, 100 - (normalizedDistance * 100));
  }

  /**
   * Calculate availability score based on driver status
   */
  private calculateAvailabilityScore(driver: Driver): number {
    switch (driver.status) {
      case "available":
        return 100;
      case "on_trip":
        return 20; // Low score, but still possible if urgent
      case "offline":
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Calculate vehicle type match score
   */
  private calculateVehicleMatchScore(driver: Driver, trip: Trip): number {
    // Perfect match
    if (driver.vehicleType === trip.vehicleType) {
      return 100;
    }

    // Check if driver's vehicle can accommodate passengers
    const vehicleCapacities: { [key: string]: number } = {
      "business_sedan": 4,
      "first_class_sedan": 4,
      "first_class_suv": 6,
      "mercedes_sprinter": 12,
      "electric_sedan": 4
    };

    const driverCapacity = vehicleCapacities[driver.vehicleType] || 0;
    
    if (driverCapacity >= trip.passengerCount) {
      return 70; // Can accommodate, but not perfect match
    }

    return 0; // Cannot accommodate passengers
  }

  /**
   * Calculate rating score based on driver's performance
   */
  private calculateRatingScore(driver: Driver): number {
    // Convert rating (1-5) to score (0-100)
    return (driver.rating / 5) * 100;
  }

  /**
   * Calculate workload score based on recent completed trips
   */
  private calculateWorkloadScore(driver: Driver): number {
    // Lower score for drivers with high workload
    const maxTrips = 20; // Maximum trips to consider for workload
    const workloadRatio = Math.min(driver.completedTrips / maxTrips, 1);
    
    // Inverse relationship: more trips = lower score
    return Math.max(0, 100 - (workloadRatio * 50)); // Max 50 point penalty
  }

  /**
   * Calculate priority multiplier based on trip priority
   */
  private getPriorityMultiplier(priority: Trip["priority"]): number {
    switch (priority) {
      case "urgent":
        return 1.5;
      case "high":
        return 1.2;
      case "medium":
        return 1.0;
      case "low":
        return 0.8;
      default:
        return 1.0;
    }
  }

  /**
   * Find the best driver for a trip using the assignment algorithm
   */
  public findBestDriver(trip: Trip): AssignmentScore[] {
    const priorityMultiplier = this.getPriorityMultiplier(trip.priority);
    const scores: AssignmentScore[] = [];

    for (const driver of this.drivers) {
      // Skip offline drivers unless trip is urgent
      if (driver.status === "offline" && trip.priority !== "urgent") {
        continue;
      }

      const proximityScore = this.calculateProximityScore(driver, trip);
      const availabilityScore = this.calculateAvailabilityScore(driver);
      const vehicleMatchScore = this.calculateVehicleMatchScore(driver, trip);
      const ratingScore = this.calculateRatingScore(driver);
      const workloadScore = this.calculateWorkloadScore(driver);

      // Weighted score calculation
      const weights = {
        proximity: 0.3,
        availability: 0.25,
        vehicleMatch: 0.2,
        rating: 0.15,
        workload: 0.1
      };

      const finalScore = (
        proximityScore * weights.proximity +
        availabilityScore * weights.availability +
        vehicleMatchScore * weights.vehicleMatch +
        ratingScore * weights.rating +
        workloadScore * weights.workload
      ) * priorityMultiplier;

      const driverLocation = driver.currentLocation || driver.location;
      const distance = this.calculateDistance(
        driverLocation.lat,
        driverLocation.lng,
        trip.pickupLocation.lat,
        trip.pickupLocation.lng
      );
      const estimatedArrival = this.calculateTravelTime(distance);

      scores.push({
        driver,
        score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
        factors: {
          proximity: Math.round(proximityScore),
          availability: Math.round(availabilityScore),
          vehicleMatch: Math.round(vehicleMatchScore),
          rating: Math.round(ratingScore),
          workload: Math.round(workloadScore)
        },
        estimatedArrival: Math.round(estimatedArrival)
      });
    }

    // Sort by score (highest first) and return top candidates
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get multiple driver options for a trip
   */
  public getDriverOptions(trip: Trip, maxOptions: number = 5): AssignmentScore[] {
    const scores = this.findBestDriver(trip);
    return scores.slice(0, maxOptions);
  }

  /**
   * Assign driver to trip (returns the best available driver)
   */
  public assignDriver(trip: Trip): Driver | null {
    const scores = this.findBestDriver(trip);
    
    if (scores.length === 0) {
      return null;
    }

    const bestScore = scores[0];
    
    // Only assign if score is above minimum threshold
    const minScore = 50; // Minimum score to accept assignment
    if (bestScore.score < minScore) {
      return null;
    }

    return bestScore.driver;
  }

  /**
   * Update driver status and location
   */
  public updateDriverStatus(driverId: string, status: Driver["status"], location?: Driver["currentLocation"]): void {
    const driver = this.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.status = status;
      if (location) {
        driver.currentLocation = location;
      }
    }
  }

  /**
   * Add new driver to the system
   */
  public addDriver(driver: Driver): void {
    this.drivers.push(driver);
  }

  /**
   * Remove driver from the system
   */
  public removeDriver(driverId: string): void {
    this.drivers = this.drivers.filter(d => d.id !== driverId);
  }

  /**
   * Get all drivers
   */
  public getDrivers(): Driver[] {
    return [...this.drivers];
  }

  /**
   * Get available drivers only
   */
  public getAvailableDrivers(): Driver[] {
    return this.drivers.filter(d => d.status === "available");
  }

  /**
   * Calculate assignment statistics
   */
  public getAssignmentStats(trip: Trip): {
    totalDrivers: number;
    availableDrivers: number;
    suitableDrivers: number;
    averageScore: number;
    bestDriver: AssignmentScore | null;
  } {
    const scores = this.findBestDriver(trip);
    const suitableDrivers = scores.filter(s => s.score >= 50);
    
    return {
      totalDrivers: this.drivers.length,
      availableDrivers: this.getAvailableDrivers().length,
      suitableDrivers: suitableDrivers.length,
      averageScore: scores.length > 0 ? 
        Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length * 100) / 100 : 0,
      bestDriver: scores.length > 0 ? scores[0] : null
    };
  }
}

export default TripAssignmentAlgorithm;
