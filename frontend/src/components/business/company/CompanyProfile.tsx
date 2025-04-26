import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Building, 
  Palette, 
  Users, 
  Package, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Save,
  Upload,
  Edit,
  Plus,
  Trash2,
  Check,
  X
} from 'lucide-react';

// Mock data for company profile
const companyData = {
  name: 'Acme Corporation',
  logo: '/images/logo.png',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  tagline: 'Innovative solutions for tomorrow\'s challenges',
  description: 'Acme Corporation is a leading provider of innovative solutions for businesses of all sizes. We specialize in cutting-edge technology that helps our clients stay ahead of the competition.',
  voiceTone: 'Professional, friendly, and helpful',
  departments: [
    { id: 'sales', name: 'Sales', head: 'John Smith', email: 'john.smith@acme.com', employees: 24 },
    { id: 'marketing', name: 'Marketing', head: 'Jane Doe', email: 'jane.doe@acme.com', employees: 18 },
    { id: 'support', name: 'Customer Support', head: 'Mike Johnson', email: 'mike.johnson@acme.com', employees: 32 },
    { id: 'engineering', name: 'Engineering', head: 'Sarah Williams', email: 'sarah.williams@acme.com', employees: 45 },
  ],
  products: [
    { 
      id: 'product1', 
      name: 'Acme Pro Suite', 
      category: 'Software', 
      description: 'All-in-one business management solution',
      price: '$99/month',
      features: ['CRM', 'Project Management', 'Invoicing', 'Reporting']
    },
    { 
      id: 'product2', 
      name: 'Acme Analytics', 
      category: 'Software', 
      description: 'Advanced analytics and business intelligence platform',
      price: '$149/month',
      features: ['Real-time dashboards', 'Custom reports', 'Data visualization', 'AI insights']
    },
    { 
      id: 'product3', 
      name: 'Acme Secure', 
      category: 'Service', 
      description: 'Comprehensive security solution for businesses',
      price: '$199/month',
      features: ['Threat detection', 'Vulnerability scanning', '24/7 monitoring', 'Incident response']
    },
  ],
  locations: [
    { 
      id: 'loc1', 
      name: 'Headquarters', 
      address: '123 Main Street, San Francisco, CA 94105', 
      phone: '+1 (415) 555-1234',
      email: 'info@acme.com',
      hours: 'Monday-Friday: 9am-5pm'
    },
    { 
      id: 'loc2', 
      name: 'New York Office', 
      address: '456 Park Avenue, New York, NY 10022', 
      phone: '+1 (212) 555-5678',
      email: 'nyc@acme.com',
      hours: 'Monday-Friday: 8am-6pm'
    },
    { 
      id: 'loc3', 
      name: 'London Office', 
      address: '10 Downing Street, London, UK SW1A 2AA', 
      phone: '+44 20 7946 0958',
      email: 'london@acme.com',
      hours: 'Monday-Friday: 9am-5:30pm'
    },
  ]
};

/**
 * CompanyProfile Component
 * 
 * Interface for configuring company-specific information including brand identity,
 * company structure, product catalog, and business locations.
 */
const CompanyProfile: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('brand');
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for form data (initialized with mock data)
  const [formData, setFormData] = useState(companyData);
  
  // Handle form input change
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle save changes
  const handleSaveChanges = () => {
    // In a real app, this would save to backend
    console.log('Saving changes:', formData);
    setEditMode(false);
  };
  
  // Handle cancel changes
  const handleCancelChanges = () => {
    // Reset form data to original data
    setFormData(companyData);
    setEditMode(false);
  };
  
  // Handle add department
  const handleAddDepartment = () => {
    // Implement add department functionality
    console.log('Adding new department');
  };
  
  // Handle add product
  const handleAddProduct = () => {
    // Implement add product functionality
    console.log('Adding new product');
  };
  
  // Handle add location
  const handleAddLocation = () => {
    // Implement add location functionality
    console.log('Adding new location');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Company Profile</h2>
          <p className="text-muted-foreground">
            Configure your company information and brand identity
          </p>
        </div>
        
        {editMode ? (
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveChanges} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancelChanges} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditMode(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Brand Identity
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Company Structure
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Catalog
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
        </TabsList>
        
        {/* Brand Identity Tab */}
        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Configure your company's brand identity and visual elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                
                {/* Company Logo */}
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Company Logo" className="h-full w-full object-contain" />
                      ) : (
                        <Building className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    {editMode && (
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Brand Colors */}
              <div className="space-y-2">
                <Label>Brand Colors</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Primary Color</span>
                      <div 
                        className="h-6 w-6 rounded-full border" 
                        style={{ backgroundColor: formData.primaryColor }}
                      ></div>
                    </div>
                    {editMode && (
                      <Input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Secondary Color</span>
                      <div 
                        className="h-6 w-6 rounded-full border" 
                        style={{ backgroundColor: formData.secondaryColor }}
                      ></div>
                    </div>
                    {editMode && (
                      <Input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accent Color</span>
                      <div 
                        className="h-6 w-6 rounded-full border" 
                        style={{ backgroundColor: formData.accentColor }}
                      ></div>
                    </div>
                    {editMode && (
                      <Input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tagline */}
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              
              {/* Company Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!editMode}
                  rows={4}
                />
              </div>
              
              {/* Voice and Tone */}
              <div className="space-y-2">
                <Label htmlFor="voice-tone">Voice and Tone</Label>
                <Textarea
                  id="voice-tone"
                  value={formData.voiceTone}
                  onChange={(e) => handleInputChange('voiceTone', e.target.value)}
                  disabled={!editMode}
                  placeholder="Describe your company's voice and tone (e.g., professional, friendly, technical)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Company Structure Tab */}
        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>
                    Manage your company's departments and organizational structure
                  </CardDescription>
                </div>
                {editMode && (
                  <Button size="sm" onClick={handleAddDepartment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.departments.map((department) => (
                  <div key={department.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium text-lg">{department.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {department.employees} employees
                        </div>
                      </div>
                      {editMode && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Department Head</Label>
                        <div className="font-medium">{department.head}</div>
                      </div>
                      <div>
                        <Label className="text-sm">Contact Email</Label>
                        <div className="font-medium">{department.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Organization Chart</CardTitle>
              <CardDescription>
                Visual representation of your company's organizational structure
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Organization chart visualization would appear here</p>
                {editMode && (
                  <Button variant="outline" size="sm" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Org Chart
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Product Catalog Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Product Catalog</CardTitle>
                  <CardDescription>
                    Manage your company's products and services
                  </CardDescription>
                </div>
                {editMode && (
                  <Button size="sm" onClick={handleAddProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.products.map((product) => (
                  <div key={product.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{product.name}</h3>
                          <div className="px-2 py-1 bg-muted rounded-full text-xs">
                            {product.category}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-lg">{product.price}</div>
                        {editMode && (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-sm">Features</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.features.map((feature, index) => (
                          <div key={index} className="px-2 py-1 bg-muted rounded-full text-xs flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Business Locations</CardTitle>
                  <CardDescription>
                    Manage your company's office locations and contact information
                  </CardDescription>
                </div>
                {editMode && (
                  <Button size="sm" onClick={handleAddLocation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.locations.map((location) => (
                  <div key={location.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-medium text-lg">{location.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {location.address}
                        </p>
                      </div>
                      {editMode && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{location.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{location.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{location.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Locations Map</CardTitle>
              <CardDescription>
                Visual map of your company's locations
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Interactive map would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyProfile;
