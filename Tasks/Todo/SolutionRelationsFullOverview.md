Extend the SolutionsInsights in insights Section. Add the capability to see all the related or enabled entity types from all the enabled solutions and make it toggleable which component types to see.

Tasks:
- analyze requirements and needs to solve problem
- Implement in a clean and effecient manner

Known Elements:
- New handling of types based on list in bottom of this file.
- checkboxes for which different component types to compare
    - all possible types
- Extension of generator and website to handle the new and added types

Code snippet from other program to reference various component types.

MIGHT BE INCOMPLETE LIST BELOW

```
private static readonly Dictionary<int, string> ComponentTypeNames = new()
    {
        { 1, "Entity" },
        { 2, "Attribute" },
        { 9, "OptionSet" },
        { 10, "Relationship" },
        { 14, "Entity Key" },
        { 20, "Security Role" },
        { 26, "SavedQuery (View)" },
        { 29, "Workflow" },
        { 50, "Ribbon Customization" },
        { 59, "Saved Query Visualization" },
        { 60, "SystemForm (Form)" },
        { 61, "Web Resource" },
        { 62, "SiteMap" },
        { 63, "Connection Role" },
        { 65, "Hierarchy Rule" },
        { 66, "Custom Control" },
        { 70, "Field Security Profile" },
        { 80, "Model-driven App" },
        { 91, "Plugin Assembly" },
        { 92, "SDK Message Processing Step" },
        { 300, "Canvas App" },
        { 372, "Connection Reference" },
        { 380, "Environment Variable Definition" },
        { 381, "Environment Variable Value" },
        { 418, "Dataflow" },
        { 3233, "Connection Role Object Type Code" },
        { 10019, "Requirement Resource Preference" },
        { 10020, "Requirement Status" },
        { 10025, "Scheduling Parameter" },
        { 10240, "Custom API" },
        { 10241, "Custom API Request Parameter" },
        { 10242, "Custom API Response Property" },
        { 10639, "Plugin Package" },
        { 10563, "Organization Setting" },
        { 10645, "App Action" },
        { 10948, "App Action Rule" },
        { 11492, "Fx Expression" },
        { 11723, "DV File Search" },
        { 11724, "DV File Search Attribute" },
        { 11725, "DV File Search Entity" },
        { 12075, "AI Skill Config" }
    };
```