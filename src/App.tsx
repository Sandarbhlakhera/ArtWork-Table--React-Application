import React, { useState, useEffect, useRef } from 'react';
import { DataTable} from 'primereact/datatable';
import type { DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

interface ApiResponse {
  data: Artwork[];
  pagination: {
    total: number;
    limit: number;
    current_page: number;
    total_pages: number;
  };
}

export default function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(12);
  const [customSelectCount, setCustomSelectCount] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());
  const [isSelectAllMode, setIsSelectAllMode] = useState(false);
  
  const overlayRef = useRef<OverlayPanel>(null);

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const data: ApiResponse = await response.json();
      
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
      syncSelectionState(data.data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncSelectionState = (currentPageData: Artwork[]) => {
    const selected: Artwork[] = [];
    
    currentPageData.forEach(artwork => {
      const isSelected = isSelectAllMode 
        ? !deselectedIds.has(artwork.id)
        : selectedIds.has(artwork.id);
      
      if (isSelected) {
        selected.push(artwork);
      }
    });
    
    setSelectedArtworks(selected);
  };

  const onSelectionChange = (e: { value: Artwork[]}) => {
    const newSelection = e.value;
    setSelectedArtworks(newSelection);
    const currentPageIds = new Set(artworks.map(a => a.id));
    const newSelectedIds = new Set(newSelection.map(a => a.id));
    
    if (isSelectAllMode) {
      const newDeselected = new Set(deselectedIds);
      currentPageIds.forEach(id => {
        if (newSelectedIds.has(id)) {
          newDeselected.delete(id); 
        } else {
          newDeselected.add(id);
        }
      });
      setDeselectedIds(newDeselected);
    } else {
      const newSelected = new Set(selectedIds);
      currentPageIds.forEach(id => {
        if (newSelectedIds.has(id)) {
          newSelected.add(id);
        } else {
          newSelected.delete(id);
        }
      });
      setSelectedIds(newSelected);
    }
  };

  const onPageChange = (event: DataTablePageEvent) => { 
    setCurrentPage(event.page! + 1);
  };
  const handleCustomSelection = () => {
  const count = parseInt(customSelectCount);
    
    if (!count || count <= 0) {
      alert('Please enter a valid number greater than 0');
      return;
    }
    setIsSelectAllMode(false);
    const estimatedTotalRows = totalRecords;
    
    if (count > estimatedTotalRows) {
      alert(`Only ${estimatedTotalRows} artworks available`);
      return;
    }
  
    const newSelected = new Set<number>();
    artworks.forEach((artwork, idx) => {
      const globalIndex = (currentPage - 1) * rowsPerPage + idx + 1;
      if (globalIndex <= count) {
        newSelected.add(artwork.id);
      }
    });
    
    setSelectedIds(newSelected);
    setDeselectedIds(new Set());
   
    overlayRef.current?.hide();
    setCustomSelectCount('');
  };

   useEffect(() => {
  syncSelectionState(artworks);
}, [artworks, selectedIds, deselectedIds, isSelectAllMode]);


  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#c0c7d2' }}>
          Art Institute of Chicago Collection
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Browse and select artworks from the collection
        </p>
      </div>

      <div style={{ 
        marginBottom: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ color: '#9facbd' }}>
          {selectedIds.size > 0 || isSelectAllMode ? (
            <span style={{ fontWeight: 500 }}>
              {isSelectAllMode 
                ? `~${Math.max(0, totalRecords - deselectedIds.size)} rows selected across all pages`
                : `${selectedIds.size} rows selected`}
            </span>
          ) : (
            <span>No rows selected</span>
          )}
        </div>
        
        <div>
          <Button
            label="Select Rows"
            icon="pi pi-check-square"
            onClick={(e) => overlayRef.current?.toggle(e)}
            style={{ 
              backgroundColor: '#292fdc',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px'
            }}
          />
          
          <OverlayPanel ref={overlayRef} style={{ width: '300px' }}>
            <div style={{ padding: '0.5rem' }}>
              <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#000000' }}>
                Custom Row Selection
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                Enter number of rows to select from the beginning
              </p>
              
              <InputText
                value={customSelectCount}
                onChange={(e) => setCustomSelectCount(e.target.value)}
                placeholder="Enter number of rows"
                type="number"
                style={{ width: '100%', marginBottom: '0.75rem' }}
              />
              
              <Button
                label="Apply Selection"
                onClick={handleCustomSelection}
                style={{ 
                  width: '100%',
                  backgroundColor: '#292fdc',
                  border: 'none',
                  padding: '0.5rem'
                }}
              />
            </div>
          </OverlayPanel>
        </div>
      </div>

      <DataTable
        value={artworks}
        selection={selectedArtworks}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        dataKey="id"
        loading={loading}
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        lazy
        first={(currentPage - 1) * rowsPerPage}
        onPage={onPageChange}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} artworks"
        style={{ 
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <Column 
          selectionMode="multiple" 
          headerStyle={{ width: '3rem', backgroundColor: '#f7f8f9' }}
        />
        <Column 
          field="title" 
          header="Title" 
          style={{ minWidth: '200px' }}
          body={(rowData) => rowData.title || 'Untitled'}
        />
        <Column 
          field="place_of_origin" 
          header="Place of Origin"
          body={(rowData) => rowData.place_of_origin || 'Unknown'}
        />
        <Column 
          field="artist_display" 
          header="Artist"
          style={{ minWidth: '200px' }}
          body={(rowData) => rowData.artist_display || 'Unknown'}
        />
        <Column 
          field="inscriptions" 
          header="Inscriptions"
          body={(rowData) => rowData.inscriptions || 'None'}
        />
        <Column 
          field="date_start" 
          header="Date Start"
          body={(rowData) => rowData.date_start || 'N/A'}
        />
        <Column 
          field="date_end" 
          header="Date End"
          body={(rowData) => rowData.date_end || 'N/A'}
        />
      </DataTable>
    </div>
  );
}