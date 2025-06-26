// src/components/year-selector.tsx

import { SelectItem } from "./ui/select";

/**
 * YearSelector Component
 *
 * This component generates a list of years for a select dropdown.
 * It calculates years from 100 years ago up to the current year.
 * The generated options can be passed directly into a <select> element.
 *
 * @returns {JSX.Element} A React fragment containing <option> elements for a select dropdown.
 */
const YearSelector = () => {
    // Get the current year
    const currentYear = new Date().getFullYear();
    // Define the start year for the list (100 years ago from the current year)
    const startYear = currentYear - 100;
    // Create an array to hold the years
    const years = [];

    // Populate the years array from the start year up to the current year
    for (let year = currentYear; year >= startYear; year--) {
        years.push(year);
    }

  return (
    <>
      {/* Map over the years array to create <option> elements for the dropdown */}
      {years.map((year) => (
        <SelectItem key={year} value={year.toString()}> {/* Ensure value is a string */}
          {year}
        </SelectItem>
      ))}
    </>
  )
}

export default YearSelector