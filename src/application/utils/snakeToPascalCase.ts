export default function snakeToPascalCase(input: string) {
  return input
    .toLowerCase() // Convert the entire string to lowercase
    .split('_') // Split the string by underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(''); // Join the words together
}
