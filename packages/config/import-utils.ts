/**
 * Shared Import Utilities
 * 
 * Provides standardized import functionality for all ListPage users.
 * Supports CSV and JSON file parsing with field mapping.
 */

export interface ImportOptions<T> {
  /** The file to import */
  file: File;
  /** Field mapping from file columns to entity fields */
  mapping: Record<string, string>;
  /** Validation function for each row */
  validate?: (row: Record<string, unknown>) => { valid: boolean; errors?: string[] };
  /** Transform function to convert parsed row to entity */
  transform?: (row: Record<string, unknown>) => T;
}

export interface ImportResult<T> {
  /** Successfully imported records */
  success: T[];
  /** Failed records with errors */
  errors: Array<{ row: number; data: Record<string, unknown>; errors: string[] }>;
  /** Total rows processed */
  total: number;
}

/**
 * Parses a CSV file into an array of objects
 */
export async function parseCSV(file: File): Promise<Record<string, string>[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const data: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    data.push(row);
  }

  return data;
}

/**
 * Parses a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

/**
 * Parses a JSON file into an array of objects
 */
export async function parseJSON(file: File): Promise<Record<string, unknown>[]> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  
  if (Array.isArray(parsed)) {
    return parsed;
  }
  
  // If it's an object with a data property that's an array, use that
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) {
    return parsed.data;
  }
  
  throw new Error("JSON file must contain an array of objects");
}

/**
 * Detects the file type and parses accordingly
 */
export async function parseFile(file: File): Promise<Record<string, unknown>[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  
  switch (extension) {
    case "csv":
      return parseCSV(file);
    case "json":
      return parseJSON(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Applies field mapping to parsed data
 */
export function applyMapping(
  data: Record<string, unknown>[],
  mapping: Record<string, string>
): Record<string, unknown>[] {
  return data.map(row => {
    const mapped: Record<string, unknown> = {};
    Object.entries(mapping).forEach(([fileColumn, entityField]) => {
      if (entityField && row[fileColumn] !== undefined) {
        mapped[entityField] = row[fileColumn];
      }
    });
    return mapped;
  });
}

/**
 * Main import function - parses file, applies mapping, validates, and transforms
 */
export async function importData<T>(options: ImportOptions<T>): Promise<ImportResult<T>> {
  const { file, mapping, validate, transform } = options;
  
  // Parse the file
  const rawData = await parseFile(file);
  
  // Apply field mapping
  const mappedData = applyMapping(rawData, mapping);
  
  const result: ImportResult<T> = {
    success: [],
    errors: [],
    total: mappedData.length,
  };

  // Process each row
  mappedData.forEach((row, index) => {
    // Validate if validator provided
    if (validate) {
      const validation = validate(row);
      if (!validation.valid) {
        result.errors.push({
          row: index + 2, // +2 for 1-indexed and header row
          data: row,
          errors: validation.errors || ["Validation failed"],
        });
        return;
      }
    }

    // Transform if transformer provided, otherwise cast
    const record = transform ? transform(row) : (row as unknown as T);
    result.success.push(record);
  });

  return result;
}

/**
 * Creates an import handler for use with ListPage
 * 
 * @example
 * ```tsx
 * const handleImport = createImportHandler({
 *   entityType: "contacts",
 *   requiredFields: ["first_name", "last_name", "email"],
 *   onImport: async (records) => {
 *     await api.contacts.bulkCreate(records);
 *     refetch();
 *   },
 * });
 * 
 * <ListPage onImport={handleImport} />
 * ```
 */
export function createImportHandler<T extends Record<string, unknown>>(config: {
  /** Entity type for error messages */
  entityType: string;
  /** Required fields that must be present */
  requiredFields?: string[];
  /** Custom validation function */
  validate?: (row: Record<string, unknown>) => { valid: boolean; errors?: string[] };
  /** Transform function to convert row to entity */
  transform?: (row: Record<string, unknown>) => T;
  /** Callback to handle the imported records */
  onImport: (records: T[]) => Promise<void>;
  /** Callback for import errors */
  onError?: (errors: ImportResult<T>["errors"]) => void;
}): (file: File, mapping: Record<string, string>) => Promise<void> {
  return async (file: File, mapping: Record<string, string>) => {
    const { requiredFields = [], validate, transform, onImport, onError } = config;

    // Create validation function that checks required fields
    const validator = (row: Record<string, unknown>) => {
      const errors: string[] = [];
      
      // Check required fields
      requiredFields.forEach(field => {
        const value = row[field];
        if (value === undefined || value === null || value === "") {
          errors.push(`Missing required field: ${field}`);
        }
      });

      // Run custom validation if provided
      if (validate) {
        const customValidation = validate(row);
        if (!customValidation.valid && customValidation.errors) {
          errors.push(...customValidation.errors);
        }
      }

      return { valid: errors.length === 0, errors };
    };

    const result = await importData<T>({
      file,
      mapping,
      validate: validator,
      transform,
    });

    // Report errors if any
    if (result.errors.length > 0 && onError) {
      onError(result.errors);
    }

    // Import successful records
    if (result.success.length > 0) {
      await onImport(result.success);
    }

    // Throw if all records failed
    if (result.success.length === 0 && result.errors.length > 0) {
      throw new Error(`Import failed: ${result.errors.length} records had errors`);
    }
  };
}

/**
 * Import template interface matching UI component
 */
export interface ImportTemplate {
  id: string;
  name: string;
  mapping: Record<string, string>;
}

/**
 * Generates import templates for common entity types
 * Returns templates with field-to-field mapping (same name by default)
 */
export function getImportTemplates(entityType: string): ImportTemplate[] {
  const templateConfigs: Record<string, Array<{ id: string; name: string; fields: string[] }>> = {
    contacts: [
      {
        id: "basic",
        name: "Basic Contact",
        fields: ["first_name", "last_name", "email"],
      },
      {
        id: "full",
        name: "Full Contact",
        fields: ["first_name", "last_name", "email", "phone", "company", "title", "type"],
      },
    ],
    crew: [
      {
        id: "basic",
        name: "Basic Crew",
        fields: ["name", "role", "department"],
      },
      {
        id: "full",
        name: "Full Crew",
        fields: ["name", "role", "department", "email", "phone", "rate", "status"],
      },
    ],
    assets: [
      {
        id: "basic",
        name: "Basic Asset",
        fields: ["name", "category", "serial_number"],
      },
      {
        id: "full",
        name: "Full Asset",
        fields: ["name", "category", "serial_number", "location", "status", "value", "purchase_date"],
      },
    ],
    equipment: [
      {
        id: "basic",
        name: "Basic Equipment",
        fields: ["name", "type", "quantity"],
      },
      {
        id: "full",
        name: "Full Equipment",
        fields: ["name", "type", "quantity", "location", "status", "serial_number", "notes"],
      },
    ],
  };

  const configs = templateConfigs[entityType] || [
    {
      id: "default",
      name: "Default Template",
      fields: ["id", "name"],
    },
  ];

  // Convert field arrays to mapping objects (field -> field)
  return configs.map(config => ({
    id: config.id,
    name: config.name,
    mapping: config.fields.reduce((acc, field) => {
      acc[field] = field;
      return acc;
    }, {} as Record<string, string>),
  }));
}

const importUtils = {
  parseCSV,
  parseJSON,
  parseFile,
  applyMapping,
  importData,
  createImportHandler,
  getImportTemplates,
};

export default importUtils;
