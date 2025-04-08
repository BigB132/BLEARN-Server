const documentationData = require('../data/documentationStructure');
const contentData = require('../data/documentationContent');
const User = require('../models/User');

const getDocumentationStructure = (req, res) => {
    res.json({ categories: documentationData.categories });
};

const getSectionContent = async (req, res) => {
    try {
        const { sectionId, email, token } = req.params;

        const user = await User.findOne({ email, token, modules: sectionId });

        if (!user) {
            return res.status(404).json({ error: 'Access denied' });
        }

        const index = user.modules.indexOf(sectionId);

        if (user.moduleTimes[index] > Date.now()) {
            if (contentData[sectionId]) {
                res.json({ content: contentData[sectionId] });
            } else {
                res.status(404).json({ error: 'Content not found' });
            }
        } else {
            res.status(404).json({ error: 'Du hast diesen Inhalt nicht freigeschaltet' });
        }
    } catch (error) {
        console.error("Error getting section content:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Search functionality
const searchDocumentation = (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    
    if (!query || query.length < 2) {
        return res.json([]);
    }
    
    const results = [];
    
    documentationData.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
            if (subcategory.name.toLowerCase().includes(query)) {
                results.push({
                    id: subcategory.id,
                    name: subcategory.name,
                    type: 'subcategory',
                    category: category.name
                });
            }
            
            // Search through chapters
            subcategory.chapters?.forEach(chapter => {
                if (chapter.name.toLowerCase().includes(query)) {
                    results.push({
                        id: chapter.id,
                        name: chapter.name,
                        type: 'chapter',
                        parentId: subcategory.id,
                        parentName: subcategory.name,
                        category: category.name
                    });
                }
            });
        });
    });
    
    Object.entries(contentData).forEach(([sectionId, content]) => {
        if (content.toLowerCase().includes(query)) {
            // Find the section info
            let foundSection = null;
            
            documentationData.categories.forEach(category => {
                category.subcategories.forEach(subcategory => {
                    if (subcategory.id === sectionId && !results.some(r => r.id === sectionId)) {
                        foundSection = {
                            id: sectionId,
                            name: subcategory.name,
                            type: 'subcategory',
                            category: category.name
                        };
                    }
                });
            });
            
            if (foundSection) {
                results.push(foundSection);
            }
        }
    });
    
    res.json(results);
};

module.exports = {
    getDocumentationStructure,
    getSectionContent,
    searchDocumentation
};