export interface PasswordRequirement {
  text: string;
  met: boolean;
}

export interface PasswordRequirementsProps {
  requirements: PasswordRequirement[];
  className?: string;
}
