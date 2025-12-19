'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, AlertCircle, Check, X, RefreshCw, MapPin, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ImportJob {
  id: string;
  type: string;
  filename: string;
  status: 'validating' | 'mapping' | 'importing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  total_records: number;
  processed_records: number;
  success_count: number;
  error_count: number;
  errors?: Array<{ row: number; field: string; message: string }>;
}

interface FieldMapping {
  source: string;
  target: string;
  sample: string;
}

const IMPORT_TYPES = [
  { id: 'contacts', label: 'Contacts', fields: ['name', 'email', 'phone', 'company', 'title'] },
  { id: 'projects', label: 'Projects', fields: ['name', 'start_date', 'end_date', 'budget', 'status'] },
  { id: 'invoices', label: 'Invoices', fields: ['invoice_number', 'amount', 'date', 'due_date', 'client'] },
  { id: 'bookings', label: 'Bookings', fields: ['event_name', 'date', 'venue', 'client', 'status'] },
];

const DEMO_IMPORTS: ImportJob[] = [
  { id: 'imp-001', type: 'contacts', filename: 'contacts-export.csv', status: 'completed', created_at: '2025-01-10T14:00:00Z', completed_at: '2025-01-10T14:05:00Z', total_records: 150, processed_records: 150, success_count: 147, error_count: 3 },
  { id: 'imp-002', type: 'projects', filename: 'projects-q4.xlsx', status: 'completed', created_at: '2025-01-05T10:00:00Z', completed_at: '2025-01-05T10:03:00Z', total_records: 25, processed_records: 25, success_count: 25, error_count: 0 },
];

export default function DataImportPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'select' | 'upload' | 'map' | 'confirm'>('select');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['import-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/settings/import');
      if (!response.ok) {
        return { jobs: DEMO_IMPORTS };
      }
      return response.json();
    },
  });

  const jobs: ImportJob[] = data?.jobs || DEMO_IMPORTS;

  const validateFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType || '');
      
      const response = await fetch('/api/settings/import/validate', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const detected = ['Name', 'Email Address', 'Phone Number', 'Company Name', 'Job Title'];
        const targetType = IMPORT_TYPES.find((t) => t.id === selectedType);
        const mappings = detected.map((source, i) => ({
          source,
          target: targetType?.fields[i] || '',
          sample: `Sample ${source}`,
        }));
        return { fields: detected, mappings };
      }
      return response.json();
    },
    onSuccess: (data) => {
      setFieldMappings(data.mappings || []);
      setStep('map');
    },
  });

  const runImport = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }
      formData.append('type', selectedType || '');
      formData.append('mappings', JSON.stringify(fieldMappings));
      
      const response = await fetch('/api/settings/import', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Import failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      setStep('select');
      setSelectedType(null);
      setUploadedFile(null);
      setFieldMappings([]);
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'importing':
      case 'validating':
      case 'mapping':
        return 'bg-primary/10 text-primary';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading import settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">Failed to load import settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Data Import
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Import data from CSV or Excel files
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-card">
        {['select', 'upload', 'map', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 ${
              step === s ? 'text-primary' : i < ['select', 'upload', 'map', 'confirm'].indexOf(step) ? 'text-success' : 'text-muted-foreground'
            }`}>
              <div className={`w-8 h-8 rounded-avatar flex items-center justify-center border-2 ${
                step === s ? 'border-primary bg-primary text-primary-foreground' : 
                i < ['select', 'upload', 'map', 'confirm'].indexOf(step) ? 'border-success bg-success text-success-foreground' : 'border-border'
              }`}>
                {i < ['select', 'upload', 'map', 'confirm'].indexOf(step) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span className="text-body-sm font-weight-medium capitalize">{s}</span>
            </div>
            {i < 3 && <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step: Select Type */}
      {step === 'select' && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Select Data Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {IMPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setStep('upload');
                }}
                className="text-left p-4 rounded-card border-2 border-border hover:border-primary transition-colors"
              >
                <p className="text-body-md font-weight-medium text-foreground">{type.label}</p>
                <p className="text-body-xs text-muted-foreground mt-1">
                  Fields: {type.fields.join(', ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">
            Upload {IMPORT_TYPES.find((t) => t.id === selectedType)?.label} File
          </h2>
          <div
            className={`border-2 border-dashed rounded-card p-12 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="text-body-md font-weight-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-body-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-2 hover:bg-muted rounded-button"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-body-md text-foreground mb-2">
                  Drag and drop your file here, or
                </p>
                <label className="px-4 py-2 bg-primary text-primary-foreground rounded-button cursor-pointer hover:bg-primary/90 transition-colors">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-body-xs text-muted-foreground mt-4">
                  Supported formats: CSV, XLSX, XLS (max 10MB)
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => {
                setStep('select');
                setSelectedType(null);
                setUploadedFile(null);
              }}
              className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => uploadedFile && validateFile.mutate(uploadedFile)}
              disabled={!uploadedFile || validateFile.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {validateFile.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Map Fields */}
      {step === 'map' && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Fields
          </h2>
          <p className="text-body-sm text-muted-foreground mb-6">
            Match the columns in your file to the fields in the system
          </p>
          <div className="space-y-4">
            {fieldMappings.map((mapping, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-center p-3 bg-muted/30 rounded-card">
                <div>
                  <p className="text-body-xs text-muted-foreground">Source Column</p>
                  <p className="text-body-sm font-weight-medium text-foreground">{mapping.source}</p>
                  <p className="text-body-xs text-muted-foreground truncate">e.g., {mapping.sample}</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-body-xs text-muted-foreground">Target Field</p>
                  <select
                    value={mapping.target}
                    onChange={(e) => {
                      const newMappings = [...fieldMappings];
                      newMappings[index].target = e.target.value;
                      setFieldMappings(newMappings);
                    }}
                    className="w-full px-3 py-1.5 border-2 border-border rounded-button focus:outline-none focus:border-primary text-body-sm"
                  >
                    <option value="">Skip this field</option>
                    {IMPORT_TYPES.find((t) => t.id === selectedType)?.fields.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('confirm')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Confirm Import</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
              <span className="text-body-sm text-muted-foreground">File</span>
              <span className="text-body-sm font-weight-medium text-foreground">{uploadedFile?.name}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
              <span className="text-body-sm text-muted-foreground">Type</span>
              <span className="text-body-sm font-weight-medium text-foreground capitalize">{selectedType}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
              <span className="text-body-sm text-muted-foreground">Fields Mapped</span>
              <span className="text-body-sm font-weight-medium text-foreground">
                {fieldMappings.filter((m) => m.target).length} of {fieldMappings.length}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('map')}
              className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => runImport.mutate()}
              disabled={runImport.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {runImport.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Start Import
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Import History */}
      <div className="bg-background border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Import History</h2>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-body-sm text-muted-foreground">No imports yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-card"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground">
                      {job.filename}
                    </p>
                    <p className="text-body-xs text-muted-foreground">
                      {formatDate(job.created_at)} • {job.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-body-sm text-foreground">
                      {job.success_count}/{job.total_records} records
                    </p>
                    {job.error_count > 0 && (
                      <p className="text-body-xs text-destructive">{job.error_count} errors</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 text-body-xs rounded capitalize ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
