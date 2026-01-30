using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Generator.Services.Plugins;

/// <summary>
/// Shared helper methods for Roslyn syntax analysis.
/// </summary>
public static class SyntaxHelpers
{
    /// <summary>
    /// Gets the fully qualified type name for a class declaration, including namespace.
    /// </summary>
    public static string GetFullTypeName(ClassDeclarationSyntax classDecl)
    {
        var parts = new List<string> { classDecl.Identifier.Text };

        var parent = classDecl.Parent;
        while (parent != null)
        {
            if (parent is NamespaceDeclarationSyntax ns)
            {
                parts.Insert(0, ns.Name.ToString());
            }
            else if (parent is FileScopedNamespaceDeclarationSyntax fsns)
            {
                parts.Insert(0, fsns.Name.ToString());
            }
            else if (parent is ClassDeclarationSyntax parentClass)
            {
                parts.Insert(0, parentClass.Identifier.Text);
            }

            parent = parent.Parent;
        }

        return string.Join(".", parts);
    }
}
