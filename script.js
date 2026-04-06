// Initialize everything when page loads
$(document).ready(function() {
    loadSummary();
    loadAllPlots();
    loadDataPreview();
    initializeCounters();
    setupRealTimeUpdates();
    initTooltips();
    
    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        mirror: false
    });
});

// Load summary with animation
function loadSummary() {
    $.ajax({
        url: '/api/data_summary',
        method: 'GET',
        success: function(data) {
            animateNumber('totalStudents', data.total_students);
            animateNumber('totalStudentsHero', data.total_students);
            animateNumber('avgStudyHours', data.avg_study_hours);
            animateNumber('avgAttendance', data.avg_attendance + '%');
            animateNumber('avgScore', data.avg_score);
            animateNumber('avgScoreHero', data.avg_score);
            
            // Calculate pass rate
            const passRate = ((data.grade_distribution?.A || 0) + 
                             (data.grade_distribution?.B || 0) + 
                             (data.grade_distribution?.C || 0)) / data.total_students * 100;
            animateNumber('passRateHero', Math.round(passRate) + '%');
        }
    });
}

// Animate number counting
function animateNumber(elementId, finalValue) {
    const element = $('#' + elementId);
    const startValue = parseInt(element.text()) || 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + (parseInt(finalValue) - startValue) * progress);
        
        if (finalValue.toString().includes('%')) {
            element.text(currentValue + '%');
        } else {
            element.text(currentValue);
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.text(finalValue);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Load all plots
function loadAllPlots() {
    loadPlot('/api/plot/distribution', '#distPlot');
    loadPlot('/api/plot/grade_pie', '#gradePlot');
    loadPlot('/api/plot/categorical_analysis', '#categoricalPlot');
    loadPlot('/api/plot/correlation', '#corrPlot');
    loadPlot('/api/plot/scatter_matrix', '#scatterPlot');
}

// Load individual plot with animation
function loadPlot(url, elementId) {
    $(elementId).addClass('loading');
    
    $.ajax({
        url: url,
        method: 'GET',
        success: function(data) {
            $(elementId).attr('src', 'data:image/png;base64,' + data.image);
            $(elementId).removeClass('loading');
            
            // Add fade-in animation
            $(elementId).hide().fadeIn(1000);
        },
        error: function(error) {
            console.error('Error loading plot:', error);
            showNotification('Failed to load plot', 'error');
        }
    });
}

// Load advanced 3D plot
function load3DPlot() {
    $.ajax({
        url: '/api/advanced/3d_scatter',
        method: 'GET',
        success: function(data) {
            const plotData = JSON.parse(data.plot);
            Plotly.newPlot('plotly3d', plotData.data, plotData.layout, {
                responsive: true,
                displayModeBar: true,
                displaylogo: false
            });
        }
    });
}

// Load parallel coordinates plot
function loadParallelPlot() {
    $.ajax({
        url: '/api/advanced/parallel_coordinates',
        method: 'GET',
        success: function(data) {
            const plotData = JSON.parse(data.plot);
            Plotly.newPlot('parallelPlot', plotData.data, plotData.layout, {
                responsive: true
            });
        }
    });
}

// Load sunburst plot
function loadSunburstPlot() {
    $.ajax({
        url: '/api/advanced/sunburst',
        method: 'GET',
        success: function(data) {
            const plotData = JSON.parse(data.plot);
            Plotly.newPlot('sunburstPlot', plotData.data, plotData.layout, {
                responsive: true
            });
        }
    });
}

// Load network plot
function loadNetworkPlot() {
    $.ajax({
        url: '/api/advanced/network',
        method: 'GET',
        success: function(data) {
            const plotData = JSON.parse(data.plot);
            Plotly.newPlot('networkPlot', plotData.data, plotData.layout, {
                responsive: true
            });
        }
    });
}

// Apply filters with animation
function applyFilters() {
    const filters = {
        gender: $('#genderFilter').val(),
        school_type: $('#schoolFilter').val(),
        internet_access: $('#internetFilter').val(),
        min_score: $('#minScore').val()
    };
    
    // Show loading animation
    $('.metric-card').addClass('loading');
    
    $.ajax({
        url: '/api/filter_data',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(filters),
        success: function(data) {
            // Update metrics with animation
            animateNumber('totalStudents', data.total_students);
            animateNumber('avgStudyHours', data.avg_study_hours);
            animateNumber('avgAttendance', data.avg_attendance + '%');
            animateNumber('avgScore', data.avg_score);
            
            // Refresh plots
            loadAllPlots();
            
            // Show success notification
            showNotification('Filters applied successfully!', 'success');
            
            $('.metric-card').removeClass('loading');
        }
    });
}

// Reset filters
function resetFilters() {
    $('#genderFilter').val('All');
    $('#schoolFilter').val('All');
    $('#internetFilter').val('All');
    $('#minScore').val('0');
    $('#scoreDisplay').text('0');
    
    applyFilters();
}

// Update score display
$('#minScore').on('input', function() {
    $('#scoreDisplay').text($(this).val());
});

// Load data preview
function loadDataPreview() {
    const sampleData = generateSampleData();
    populateTable(sampleData);
}

// Generate sample data for preview
function generateSampleData() {
    const data = [];
    for (let i = 1; i <= 20; i++) {
        data.push({
            id: i,
            study_hours: (Math.random() * 30 + 5).toFixed(1),
            attendance: Math.floor(Math.random() * 30 + 70),
            prev_score: Math.floor(Math.random() * 40 + 60),
            internet: Math.random() > 0.2 ? 'Yes' : 'No',
            school: Math.random() > 0.4 ? 'Public' : 'Private',
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            parent_edu: ['High School', 'Bachelor', 'Master', 'PhD'][Math.floor(Math.random() * 4)],
            score: Math.floor(Math.random() * 40 + 60),
            grade: getGrade(Math.floor(Math.random() * 40 + 60))
        });
    }
    return data;
}

function getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

// Populate table with data
function populateTable(data) {
    const tbody = $('#dataPreview tbody');
    tbody.empty();
    
    data.forEach(row => {
        const rowClass = row.score >= 90 ? 'table-success' : 
                        row.score >= 70 ? 'table-info' : 
                        row.score >= 60 ? 'table-warning' : 'table-danger';
        
        tbody.append(`
            <tr class="${rowClass}" data-aos="fade-up" data-aos-delay="${row.id * 50}">
                <td>${row.id}</td>
                <td>${row.study_hours}</td>
                <td>${row.attendance}%</td>
                <td>${row.prev_score}</td>
                <td><span class="badge ${row.internet === 'Yes' ? 'bg-success' : 'bg-danger'}">${row.internet}</span></td>
                <td>${row.school}</td>
                <td>${row.gender}</td>
                <td>${row.parent_edu}</td>
                <td><strong>${row.score}</strong></td>
                <td><span class="badge bg-primary">${row.grade}</span></td>
            </tr>
        `);
    });
}

// Initialize counters
function initializeCounters() {
    $('.counter').each(function() {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 4000,
            easing: 'swing',
            step: function(now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
}

// Setup real-time updates
function setupRealTimeUpdates() {
    setInterval(function() {
        loadSummary();
    }, 30000); // Update every 30 seconds
}

// Initialize tooltips
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Show notification
function showNotification(message, type) {
    const notification = $(`
        <div class="notification notification-${type}" data-aos="fade-left">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        </div>
    `);
    
    $('body').append(notification);
    
    setTimeout(() => {
        notification.fadeOut(500, function() {
            $(this).remove();
        });
    }, 3000);
}

// Export functions
function exportAllData() {
    showNotification('Exporting data...', 'success');
    // Implement export logic
}

function exportPlots() {
    showNotification('Exporting plots...', 'success');
    // Implement plot export
}

function exportReport() {
    showNotification('Generating PDF report...', 'success');
    // Implement report generation
}

function shareResults() {
    showNotification('Share link copied to clipboard!', 'success');
    // Implement sharing
}

// Add parallax effect
$(window).on('scroll', function() {
    const scrolled = $(window).scrollTop();
    $('.hero-title').css('transform', 'translateY(' + (scrolled * 0.3) + 'px)');
    $('.orb-1').css('transform', 'translate(' + (scrolled * 0.1) + 'px, ' + (scrolled * 0.1) + 'px)');
    $('.orb-2').css('transform', 'translate(-' + (scrolled * 0.1) + 'px, -' + (scrolled * 0.1) + 'px)');
});

// Add particle effect on click
$(document).on('click', function(e) {
    for (let i = 0; i < 10; i++) {
        createParticle(e.clientX, e.clientY);
    }
});

function createParticle(x, y) {
    const particle = $('<div class="particle"></div>');
    particle.css({
        left: x + 'px',
        top: y + 'px',
        background: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
    
    $('body').append(particle);
    
    particle.animate({
        left: x + (Math.random() - 0.5) * 200 + 'px',
        top: y + (Math.random() - 0.5) * 200 + 'px',
        opacity: 0
    }, {
        duration: 1000,
        complete: function() {
            $(this).remove();
        }
    });
}