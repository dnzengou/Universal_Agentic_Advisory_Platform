import type { AdvisoryOutput, ExportConfig, Template, KPI, UserStory, Framework } from '@/types';

export class ExportManager {
  static exportToJSON(data: any, filename: string = 'export'): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadBlob(blob, `${filename}.json`);
  }

  static exportToCSV(data: any[], filename: string = 'export'): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const value = row[h];
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  static exportOutputs(outputs: AdvisoryOutput[], config: ExportConfig): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = config.filename || `advisory-outputs-${timestamp}`;

    switch (config.format) {
      case 'json':
        this.exportToJSON(outputs, filename);
        break;
      case 'csv':
        const flattenedData = outputs.map(o => ({
          id: o.id,
          type: o.type,
          title: o.title,
          createdAt: o.createdAt,
          ...o.content
        }));
        this.exportToCSV(flattenedData, filename);
        break;
      case 'pdf':
        this.exportToPDF(outputs, filename);
        break;
      default:
        this.exportToJSON(outputs, filename);
    }
  }

  static exportTemplate(template: Template, format: 'json' | 'markdown' | 'docx' = 'json'): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

    switch (format) {
      case 'json':
        this.exportToJSON(template, filename);
        break;
      case 'markdown':
        const markdown = this.templateToMarkdown(template);
        const mdBlob = new Blob([markdown], { type: 'text/markdown' });
        this.downloadBlob(mdBlob, `${filename}.md`);
        break;
    }
  }

  static exportKPIs(kpis: KPI[], format: 'json' | 'csv' = 'csv'): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `kpi-framework-${timestamp}`;

    if (format === 'json') {
      this.exportToJSON(kpis, filename);
    } else {
      this.exportToCSV(kpis, filename);
    }
  }

  static exportUserStories(stories: UserStory[], format: 'json' | 'csv' = 'csv'): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `user-stories-${timestamp}`;

    if (format === 'json') {
      this.exportToJSON(stories, filename);
    } else {
      const flattened = stories.map(s => ({
        id: s.id,
        title: s.title,
        asA: s.asA,
        iWant: s.iWant,
        soThat: s.soThat,
        priority: s.priority,
        storyPoints: s.storyPoints,
        acceptanceCriteria: s.acceptanceCriteria.join('; ')
      }));
      this.exportToCSV(flattened, filename);
    }
  }

  static exportFramework(framework: Framework, format: 'json' | 'markdown' = 'markdown'): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `framework-${framework.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

    if (format === 'json') {
      this.exportToJSON(framework, filename);
    } else {
      const markdown = this.frameworkToMarkdown(framework);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      this.downloadBlob(blob, `${filename}.md`);
    }
  }

  static async exportDashboardToImage(elementId: string, filename: string = 'dashboard'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `${filename}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to export dashboard:', error);
    }
  }

  static async exportToPDF(data: any[], filename: string = 'export'): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      let y = 20;
      const pageHeight = doc.internal.pageSize.height;

      doc.setFontSize(16);
      doc.text('Advisory Framework Output', 20, y);
      y += 15;

      doc.setFontSize(12);

      for (const item of data) {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }

        const title = typeof item === 'object' ? item.title || 'Item' : 'Item';
        const content = typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item);

        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(content, 170);
        
        for (const line of lines) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 20, y);
          y += 7;
        }

        y += 10;
      }

      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static templateToMarkdown(template: Template): string {
    const sections = template.sections.map(s => 
      `## ${s.title}\n\n${s.content}\n\n${s.placeholder ? `_Placeholder: ${s.placeholder}_` : ''}`
    ).join('\n\n');

    return `# ${template.name}\n\n**Category:** ${template.category}\n\n**Description:** ${template.description}\n\n**Variables:** ${template.variables.join(', ')}\n\n---\n\n${sections}`;
  }

  private static frameworkToMarkdown(framework: Framework): string {
    const principles = framework.principles.map(p => `- ${p}`).join('\n');
    const components = framework.components.map(c => 
      `### ${c.name}\n\n${c.description}\n\n**Inputs:** ${c.inputs.join(', ')}\n\n**Outputs:** ${c.outputs.join(', ')}`
    ).join('\n\n');

    const applicability = framework.applicability.map(a => `- ${a}`).join('\n');

    return `# ${framework.name}\n\n${framework.description}\n\n## Principles\n\n${principles}\n\n## Components\n\n${components}\n\n## Applicability\n\n${applicability}`;
  }

  // Generate a comprehensive report
  static generateReport(options: {
    title: string;
    sections: { title: string; content: any }[];
    includeTimestamp: boolean;
    includeMetadata: boolean;
  }): string {
    const { title, sections, includeTimestamp, includeMetadata } = options;
    
    let report = `# ${title}\n\n`;
    
    if (includeTimestamp) {
      report += `*Generated: ${new Date().toLocaleString()}*\n\n`;
    }

    if (includeMetadata) {
      report += `---\n\n**Report Type:** Advisory Framework Output\n**Version:** 1.0\n**Classification:** Internal\n\n---\n\n`;
    }

    for (const section of sections) {
      report += `## ${section.title}\n\n`;
      
      if (typeof section.content === 'object') {
        report += '```json\n' + JSON.stringify(section.content, null, 2) + '\n```\n\n';
      } else {
        report += `${section.content}\n\n`;
      }
    }

    return report;
  }
}

export default ExportManager;
