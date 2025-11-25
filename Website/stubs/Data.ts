/// Used in github workflow to generate stubs for data
/// This file is a stub and should not be modified directly.

import { GroupType, SolutionWarningType } from "@/lib/Types";

export const LastSynched: Date = new Date();
export const Logo: string | null = null;
export const SolutionCount: number = 0;

export let Groups: GroupType[] = [
  {
    "Name": "Sample Data",
    "Entities": [
      {
        "DisplayName": "Account",
        "SchemaName": "Account",
        "Description": "Business organization or customer",
        "Group": "Sample Data",
        "IsAuditEnabled": true,
        "IsActivity": false,
        "IsNotesEnabled": true,
        "IsCustom": true,
        "Ownership": 1,
        "Attributes": [
          {
            "AttributeType": "StringAttribute",
            "IsPrimaryId": true,
            "IsPrimaryName": false,
            "IsCustomAttribute": false,
            "IsStandardFieldModified": false,
            "DisplayName": "Account ID",
            "SchemaName": "accountid",
            "Description": "Unique identifier for the account",
            "RequiredLevel": 3,
            "IsAuditEnabled": false,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "IsExplicit": true,
            "Format": "Text",
            "MaxLength": 100,
            "AttributeUsages": [],
            "Solutions": [],
          },
          {
            "AttributeType": "StringAttribute",
            "IsPrimaryId": false,
            "IsPrimaryName": true,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "DisplayName": "Account Name",
            "SchemaName": "name",
            "Description": "The name of the account",
            "RequiredLevel": 2,
            "IsAuditEnabled": true,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "Format": "Text",
            "IsExplicit": true,
            "MaxLength": 160,
            "AttributeUsages": [],
            "Solutions": [],
          },
          {
            "AttributeType": "StringAttribute",
            "IsPrimaryId": false,
            "IsPrimaryName": false,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "DisplayName": "Phone",
            "SchemaName": "telephone1",
            "Description": "The main phone number for the account",
            "RequiredLevel": 0,
            "IsExplicit": false,
            "IsAuditEnabled": false,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "Format": "Phone",
            "MaxLength": 50,
            "AttributeUsages": [],
            "Solutions": [],
          },
          {
            "AttributeType": "LookupAttribute",
            "IsPrimaryId": false,
            "IsPrimaryName": false,
            "IsCustomAttribute": true,
            "IsStandardFieldModified": false,
            "DisplayName": "Primary Contact",
            "SchemaName": "primarycontactid",
            "Description": "The primary contact for the account",
            "RequiredLevel": 0,
            "IsExplicit": false,
            "IsAuditEnabled": true,
            "IsColumnSecured": false,
            "CalculationMethod": null,
            "AttributeUsages": [],
            "Solutions": [],
            "Targets": [
              {
                "Name": "Contact",
                "IsInSolution": true
              }
            ]
          }
        ],
        "Relationships": [],
        "SecurityRoles": [],
        "Keys": [],
        "IconBase64": null,
        "Solutions": [],
      }
    ]
  }
];

export let SolutionWarnings: SolutionWarningType[] = [];